import { find, filter } from 'lodash'

const HubUser = class HubUser {
  constructor (user) {
    this.email = user.email
    this.id = user.id
    this.roles = user.roles.data

    const details = null // meh, that'll do

    if (!details) {
      // TODO: Don't hardcode this in, maybe go to null?
      this.area = 'order-processing.dashboard'
    } else {
      const fields = details.fields
      this.area = fields.hub_area || 'order-processing.dashboard'
    }

    this.permissions = []

    user.roles.data.forEach((role) => {
      // const permissions = role.permissions.data
      this.permissions = []
    })
  }

  can (check) {
    return this.performCheck('permissions', check)
  }

  hasRole (check) {
    return this.performCheck('roles', check)
  }

  performCheck (field, check) {
    let result = true
    if (Array.isArray(check)) {
      result = filter(this[field], (item) => {
        return check.includes(item.guard_name) || check.includes(item.name)
      }).length
    } else {
      result = find(this[field], (item) => {
        return item.name === check || item.guard_name === check
      })
    }
    return Boolean(result)
  }
}

export default class ProxyScheme {
  constructor (auth, options) {
    this.$auth = auth
    this.name = options._name
    this.options = Object.assign({}, DEFAULTS, options)
  }

  _setToken (token) {
    if (this.options.globalToken) {
      const axios = this.$auth.ctx.app.$axios
      axios.setHeader(this.options.tokenName, token)
      axios.setHeader('X-CANDY-HUB', true)

      this.$auth.ctx.app.$gc.setHttp(axios)

      var newToken = token;
      this.$auth.ctx.app.$getcandy.setToken(newToken.replace('Bearer ', ''))
      this.$auth.ctx.app.$getcandy.setDefaultHeaders({
        'X-CANDY-HUB': true
      })
    }
  }

  _clearToken () {
    if (this.options.globalToken) {
      // Clear Authorization token for all axios requests
      this.$auth.ctx.app.$axios.setHeader(this.options.tokenName, false)
    }
  }

  mounted () {
    if (this.options.tokenRequired) {
      const token = this.$auth.syncToken(this.name)
      this._setToken(token)
    }

    return this.$auth.fetchUserOnce()
  }

  async login (endpoint) {
    if (!this.options.endpoints.login) {
      return
    }

    // Ditch any leftover local tokens before attempting to log in
    await this._logoutLocally()

    const result = await this.$auth.request(
      endpoint,
      this.options.endpoints.login
    )

    if (this.options.tokenRequired) {
      const token = result.token_type + ' ' + result.access_token

      this.$auth.setToken(this.name, token)
      this._setToken(token)
    }

    return this.fetchUser()
  }

  async setUserToken (tokenValue) {
    // Ditch any leftover local tokens before attempting to log in
    await this._logoutLocally()

    if (this.options.tokenRequired) {
      const token = this.options.tokenType
        ? this.options.tokenType + ' ' + tokenValue
        : tokenValue

      this.$auth.setToken(this.name, token)
      this._setToken(token)
    }

    return this.fetchUser()
  }

  async fetchUser (endpoint) {

    // Token is required but not available
    if (this.options.tokenRequired && !this.$auth.getToken(this.name)) {
      return
    }

    // User endpoint is disabled.
    if (!this.options.endpoints.user) {
      this.$auth.setUser({})
      return
    }

    // Try to fetch user and then set
    const user = await this.$auth.requestWith(
      this.name,
      endpoint,
      this.options.endpoints.user
    )

    const hubUser = new HubUser(user)

    if (!hubUser.hasRole('admin') && !hubUser.can('access_hub')) {
      await this.logout()
      return
    }

    this.$auth.setUser(hubUser)
  }

  async logout (endpoint) {
    // Only connect to logout endpoint if it's configured
    if (this.options.endpoints.logout) {
      await this.$auth
        .requestWith(this.name, endpoint, this.options.endpoints.logout)
        .catch(() => { })
    }

    // But logout locally regardless
    return this._logoutLocally()
  }

  async _logoutLocally () {
    if (this.options.tokenRequired) {
      this._clearToken()
    }

    return this.$auth.reset()
  }
}

const DEFAULTS = {
  tokenRequired: true,
  tokenType: 'Bearer',
  globalToken: true,
  tokenName: 'Authorization'
}
