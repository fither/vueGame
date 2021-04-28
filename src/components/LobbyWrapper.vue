<template>
    <div id="lobby-wrapper">
        <h3>Welcome To Lobby</h3>
        <button v-on:click="logout()">Perform Logout</button>
    </div>
</template>

<script>
export default {
    name: 'lobby-wrapper',
    methods: {
        logout() {
            this.$store.commit('logout');
            this.$store.commit('changeScene', 'LoginWrapper');
        }
    }

}
</script>

<style>

</style>