// localStorage persistence
var STORAGE_KEY = 'accounts-vuejs-2.0'
var accountStorage = {
  fetch: function () {
    var accounts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    // todos.forEach(function (todo, index) {
    //   todo.id = index
    // })
    // todoStorage.uid = todos.length
    return accounts
  },
  save: function (accounts) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts))
  }
}
 function setInterestRates(a){
   a.iRate =parseFloat(((a.interest / a.new_balance) * 12).toFixed(3));
  //  a.iRate =parseFloat(((a.interest / a.previous_balance) * 12).toFixed(3));
  //  console.log(`iRate: ${a.name} ${a.iRate}`)
  return a
  }

var mystore = {
  state: {
    lunches: [],
    groups: [],
    accounts: [],
    isLoggedIn: false,
    token: localStorage.getItem('token') || '',
    user : {},
    users: [],
    income: {
      retire: 2435,
      nss: 1231,
      bss: 1845,
      npay: 1200  
    }
  },
  getters: {
    totalIncome: state => {
    var x = 0
      for (var key in state.income) {
        console.log(key, state.income[key]);
        x += state.income[key]
      }
      return x
    },
    lunches: state => {
      return state.lunches
    },
    groups: state => {
      return state.groups
    },
    accounts: state => {
      return state.accounts
    },
    latestAccounts: state => {
      function removeZeros(a){
        return a.new_balance > 300 * 100; // nothing less than $200
      }
       var accountsObj = {}
      state.accounts.filter(removeZeros).forEach(function(a){
        if (!accountsObj[a.name]){
          accountsObj[a.name] = [a]
        } else {
          accountsObj[a.name].push(a)
        }
      })
      var accts = []
      for (var key in accountsObj){
        var len = accountsObj[key].length
        accts.push(accountsObj[key][len-1]) // get last account in each 
      }
      accts = accts.filter(m => {
        return (m.debttype == 'store') || (m.debttype == 'card')
      })
      accts = accts.filter(m => {
        return (m.owner == 'brian') 
      })
      // here we inject minimum percentage for each account
      accts.forEach((a, index) => {
        if (a.previous_balance == 0){
          a.min_percent = 0
        } else {
          a.min_percent = parseFloat(((a.minimum / a.new_balance)*100).toFixed(2))
        }
      })
      accts.map(setInterestRates )
      accts.sort((a,b) => {
        var x = a.iRate//new_balance
        var y = b.iRate//new_balance
        if (x > y) {
          return -1;
        } else if (y > x) {
          return 1;
        } else {
          return 0;
        }
        return x - y
      })
      // accts.sort(function(a, b){
      //   var x = a.new_balance
      //   var y = b.new_balance
      //   return x - y
      // })
      // console.log(`sorted accts: ${JSON.stringify(accts, null, 3)}`)
      return accts
  },
    groups: state => {
      return state.groups
    }
  },
  mutations: {
    loadAccounts (state,payload){
      console.log(`mutations: payload: ${payload.length}`)
      state.accounts = payload
    },
    addAccount (state,payload){
      state.accounts.push(payload)
    },
    updateAccount (state,payload){
      console.log(` updateAccount (store.js)=${JSON.stringify(payload, null, 3)}`)
      //state.accounts.push(payload)
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
    }
  },
  actions: {
       // accounts
       async loadAccounts ({ commit }) {

         if (!localStorage.getItem(STORAGE_KEY)){

           console.log(`loadAccounts *********************************************************`)
           const response = await fetch('http://localhost:3019/accounts');
           const json = await response.json();
           // console.log("got json accounts" + json);
           localStorage.setItem(STORAGE_KEY, JSON.stringify(json))
           commit('loadAccounts',json)            
          } else {
            console.log(`loadAccounts from storage**************************************`)
            var response = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
            // const response = await fetch('http://localhost:3019/accounts');
            // const json = await response.json();
            // console.log("got json accounts" + json);
            commit('loadAccounts',response)            
          
        }

        //.then(json => console.log(json)))
      },
      async addAccount ({ commit },account) {
        // var lunches = (await LunchService.index()).data
        var url = "http://localhost:3019/accounts"
        console.log(` adding account ${JSON.stringify(account, null, 3)}`)
        const response = await fetch(url, {
          body: JSON.stringify(account), // must match 'Content-Type' header
          headers: {
            // 'user-agent': 'Mozilla/4.0 MDN Example',
            "Content-type": "application/json; charset=UTF-8"
          },
          method: 'POST', // *GET, POST, PUT, DELETE, etc.
        })
        const json = await response.json();
        // console.log(json);
        commit('addAccount',  json)
        
      },



      // const myHeaders = new Headers();

      // myHeaders.append('Content-Type', 'application/json');
      // myHeaders.append('Authorization', '1234abcd');
      
      // return fetch('http://localhost:8080/clients/', {
      //   method: 'GET',
      //   headers: myHeaders,
      // })


      async updateAccount ({ commit, state },payload) {
        // var lunches = (await LunchService.index()).data
        var url = "http://localhost:3019/accounts/"+payload._id
        console.log(` updateAccount (store.js)=${JSON.stringify(payload, null, 3)}`)
        console.log(` updateAccount (store.js)=${url}`)
        console.log(` updateAccount (store.js) token=${state.token}`)
        const response = await fetch(url, {
          body: JSON.stringify(payload), // must match 'Content-Type' header
          headers: {
            // 'user-agent': 'Mozilla/4.0 MDN Example',
            'authorization': state.token,
            "Content-type": "application/json; charset=UTF-8"
          },
          method: 'PATCH', // *GET, POST, PUT, DELETE, etc.
        })
        const json = await response.json();
        // console.log(json);
        commit('updateAccount',  json)
       },
       // user
     async login({commit}, data){
      console.log(` adding user ${JSON.stringify(data, null, 3)}`)
      commit('auth_request')
      const response = await fetch('http://localhost:3029/user/login', {
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
      const response = await fetch('http://localhost:3029/user/signup', {
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
  async loadLunches ({ commit }) {
    console.log(`loadLunches*********************************************************`)
      const response = await fetch('http://localhost:3029/lunches');
      const json = await response.json();
      commit('loadLunches',json)            
  },
  async addLunch ({ commit },lunch) {
   // var lunches = (await LunchService.index()).data
   // console.log(` got all lunches cnt=${this.lunches.length}`)
   var url = "http://localhost:3029/lunches"
        console.log(` adding lunch ${JSON.stringify(lunch, null, 3)}`)
        const response = await fetch(url, {
          body: JSON.stringify(lunch), // must match 'Content-Type' header
          headers: {
            // 'user-agent': 'Mozilla/4.0 MDN Example',
            "Content-type": "application/json; charset=UTF-8"
          },
          method: 'POST', // *GET, POST, PUT, DELETE, etc.
        })
        const json = await response.json();


    commit('addLunch', json)
  },
  // async updateLunch ({ commit },payload) {
  //  // var lunches = (await LunchService.index()).data
  //  console.log(` updateLunch (store.js)=${JSON.stringify(payload, null, 3)}`)
  //   commit('updateLunch',  (await LunchService.put(payload)).data)
  // },
  // async loadGroups ({ commit }) {
  // //  var lunches = (await LunchService.index()).data
  //   console.log(` loading all groups******************`)
  //   commit('loadGroups',  (await GroupService.index()).data)
  //  },
  // async addGroup ({ commit}, group) {
  //   var group = (await GroupService.post(group)).data
   
  //   commit('addGroup',  group)
  // }
  }
}

// var url = "http://localhost:3019/accounts"
// fetch(url)
//   .then(response => response.json())
//   .then(json => console.log(json))