<template>
    <div>
        {{ welcome }}
    </div>
</template>

<script>
    module.exports = {
// export default {
    name: 'Profile',
    props: ['msg'],
    data() {
        return {
            welcome: 'This is your profile'
        }
    },
    mounted() {
        if (this.msg) {
            this.welcome = this.msg    
        }

    }
}
</script>