import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
import LunchService from '@/services/LunchService'
import GroupService from '@/services/GroupService'
import AccountService from '@/services/AccountService'

export default new Vuex.Store({
  state: {
    lunches: null,
    groups: [],
    accounts: null,
    isLoggedIn: false,
    token: localStorage.getItem('token') || '',
    user : {},
    users: []
  },
  getters: {
    lunches: state => {
      return state.lunches
    },
    latestAccounts: state => {
      return state.accounts
    },
    groups: state => {
      return state.groups
    }
  },
  mutations: {
    loadLunches (state,lunches){
      state.lunches = lunches
    },
    addLunch (state,lunch){
      console.log(`mutations: addLunch: ${JSON.stringify(lunch, null, 3)}`)
      state.lunches.push(lunch)
    },
    addGroup (state,group){
      console.log("addGroup " + JSON.stringify(group, null, 3))
      state.groups.push(group)
    },
    loadGroups (state,payload){
      state.groups = payload
    },
    updateLunch (state,lunch){
      console.log("mutation: updateLunch " + JSON.stringify(lunch, null, 3))
      //state.groups.push(group)
    },
    loadAccounts (state,payload){
      state.accounts = payload
    },
    addAccount (state,payload){
      console.log(`mutations: addAccount: ${JSON.stringify(payload, null, 3)}`)
      state.accounts.push(payload)
    },
    auth_users(state, {token, users}){
			state.users = users
		},
		auth_request(state){
	    	state.status = 'loading'
	  	},
    auth_success(state, payload){
    // auth_success(state, {token, user}){
      state.status = 'success'
      state.token = payload.token
      console.log(`saving state user to ${JSON.stringify(payload, null, 3)}`)
      state.user = payload.myuser
      state.isLoggedIn = true
    },
    auth_error(state){
      state.status = 'error'
    },
    logout(state){
      state.status = ''
      state.token = ''
      state.isLoggedIn = false
    },
  },
  actions: {
    async actionA ({ commit }) {
      commit('gotData', await getData())
    },
    async loadLunches ({ commit }) {
      console.log(`loadLunches*********************************************************`)
     // var lunches = (await LunchService.index()).data
     // console.log(` got all lunches cnt=${this.lunches.length}`)
      commit('loadLunches',  (await LunchService.index()).data)
    },
    async addLunch ({ commit },lunch) {
     // var lunches = (await LunchService.index()).data
     // console.log(` got all lunches cnt=${this.lunches.length}`)
      commit('addLunch',  (await LunchService.post(lunch)).data)
    },
    async updateLunch ({ commit },payload) {
     // var lunches = (await LunchService.index()).data
     console.log(` updateLunch (store.js)=${JSON.stringify(payload, null, 3)}`)
      commit('updateLunch',  (await LunchService.put(payload)).data)
    },
    // groups
    async loadGroups ({ commit }) {
    //  var lunches = (await LunchService.index()).data
      console.log(` loading all groups******************`)
      commit('loadGroups',  (await GroupService.index()).data)
     },
    async addGroup ({ commit}, group) {
      var group = (await GroupService.post(group)).data
     
      commit('addGroup',  group)
    },
    // accounts
    async loadAccounts ({ commit }) {
      console.log(`loadLunches*********************************************************`)
     // var lunches = (await LunchService.index()).data
     // console.log(` got all lunches cnt=${this.lunches.length}`)
      commit('loadAccounts',  (await AccountService.index()).data)
    },
    async addAccount ({ commit },lunch) {
     // var lunches = (await LunchService.index()).data
     // console.log(` got all lunches cnt=${this.lunches.length}`)
      commit('addLunch',  (await AccountService.post(lunch)).data)
    },
    async updateAccount ({ commit },payload) {
     // var lunches = (await LunchService.index()).data
     console.log(` updateAccount (store.js)=${JSON.stringify(payload, null, 3)}`)
      commit('updateAccount',  (await AccountService.patch(payload)).data)
    },
     // user
     async login({commit}, data){
      console.log(` adding user ${JSON.stringify(data, null, 3)}`)
      commit('auth_request')
      const response = await fetch('http://localhost:3000/user/login', {
          body: JSON.stringify(data), // must match 'Content-Type' header
          headers: {
            "Content-type": "application/json; charset=UTF-8"
          },
          method: 'POST', // *GET, POST, PUT, DELETE, etc.
        })
        const json = await response.json();
        // console.log(json);
        // commit('user added',  json)
        console.log(` response from fetch user ${JSON.stringify(json, null, 3)}`)
        const token = json.token
        const myuser = json.user
        //	debugger
        localStorage.setItem('token', token)
      // Add the following line:
    //  axios.defaults.headers.common['Authorization'] = token
      commit('auth_success', {token, myuser})
  },
    async register({commit}, data){
      console.log(` register user ${JSON.stringify(data, null, 3)}`)
      commit('auth_request')
      const response = await fetch('http://localhost:3019/user/signup', {
          body: JSON.stringify(data), // must match 'Content-Type' header
          headers: {
            "Content-type": "application/json; charset=UTF-8"
          },
          method: 'POST', // *GET, POST, PUT, DELETE, etc.
        })
        const json = await response.json();
        // console.log(json);
        // commit('user added',  json)
        console.log(` response from fetch user ${JSON.stringify(json, null, 3)}`)
        const token = json.token
        const myuser = json.user
        //	debugger
        localStorage.setItem('token', token)
      // Add the following line:
    //  axios.defaults.headers.common['Authorization'] = token
      commit('auth_success', {token, myuser})
  },
       // accounts
  logout({commit}){
    return new Promise((resolve, reject) => {
      console.log(`mystore: actions: logout........`)
        commit('logout')
        localStorage.removeItem('token')
       // delete axios.defaults.headers.common['Authorization']
        resolve()
    })
  },
  }
})
