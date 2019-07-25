<template>
  
</template>

<script>

const HomeModule = {
  namespaced: true,
  state() {
    return {
      count: 0,
    };
  },
  mutations: {
    increment(state) {
      state.count++;
    },
  },
};

const ns = 'home';


 module.exports = {
created() {
    if (!this.$store.state[ns]) {
      this.$store.registerModule(ns, HomeModule);
    }
  },
  computed: Vuex.mapState(ns, ['count']),
  methods: Vuex.mapMutations(ns, ['increment']),
}
}
</script>

<style>

</style>
