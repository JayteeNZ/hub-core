<template>
    <div class="mt-1 relative rounded-md shadow-sm">
        <input :value="value" @input="$emit('input', $event.target.value)" class="form-input block w-full sm:text-sm sm:leading-5" :placeholder="placeholder" />
    </div>
</template>

<script>
export default {
    props: {
        value: {
            default: null
        },
        type: {
            type: String,
            default: 'text'
        },
        placeholder: {
            type: String,
            default: null
        }
    }
}
</script>