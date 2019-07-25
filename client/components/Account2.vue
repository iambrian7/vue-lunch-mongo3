<template>
  <div id="account2">
    <button @click="getAllAccounts">GetAllAccounts</button>
    <div class="account-container">
      <div class="bkc-list" v-if="!account">
        <div class="item" @click="account = blankAcct, editing=!editing">new account....</div>
        <div class="item" @click="account = item" v-for="(item, index) in filteredAccounts" :key="index">{{ item.name }}</div>
      </div>
      <div class="bkc-detail" v-if="account">
            <h1> Account: {{account.name}} <span class="edit-button" @click="editing = !editing">Edit</span></h1> 
          <div class="account-fields">
              <div class="acct-props" v-for="(v,k) in account" v-model="account.k">
                {{ k }} : <input v-model="account[k]" v-if="editing">
                <span v-if="!editing">{{ v }}</span>
                
              </div>
          </div>
          <div class="control-container">
            <!-- <div class="submit-edit" v-if="adding" @click="adding = !adding">Edit</div>
            <div class="submit-edit" v-if="!adding" @click="adding = !adding">Add</div> -->
            <div v-if="adding" class="submit-edit" @click="addAccount(account)">Add Account</div>
            <div v-else-if="editing" class="submit-edit" @click="editAccount(account)">Submit</div>
            <div v-else class="submit-edit" @click="editAccount(account)">Submitxxx</div>
            <div class="cancel-edit" @click="account = null, editing = false">Cancel</div>
          </div>
      </div>
    </div>
         <div class="account-edit" v-if="account">
        <h1>Account: {{newAccount.name}} </h1>
        <h3>Update or add new account</h3>
        <form @submit="checkForm">
          <p v-if="errors.length">
            <b>Please correct the following error(s):</b>
            <ul>
              <li v-for="error in errors">{{ error }}</li>
            </ul>
          </p>
          <div class="form-labels">
              <label>Namexxx</label><input type="text" v-model="newAccount.name" placeholder="name..." required>
              <label>prev_balance</label><input type="text" v-model="newAccount.previous_balance" placeholder="previous_balance...">
              <label>number</label><input type="text" v-model="newAccount.number" placeholder="number..." required>
              <label>new_balance</label><input type="text" v-model="newAccount.new_balance" placeholder="new_balance...">
              <label>datedue</label><input type="text" v-model="newAccount.datedue" placeholder="datedue...">
              <label>minimum</label><input type="text" v-model="newAccount.minimum" placeholder="minimum...">
              <label>owner</label><input type="text" v-model="newAccount.owner" placeholder="owner...">
              <label>interest</label><input type="text" v-model="newAccount.interest" placeholder="interest...">
              <label>debttype</label><input type="text" v-model="newAccount.debttype" placeholder="debttype...">
              <label>purchases</label>     <input type="text" v-model="newAccount.purchases" placeholder="purchases...">
              <label>limit</label><input type="text" v-model="newAccount.limit" placeholder="limit...">
              <label>payment</label><input type="text" v-model="newAccount.payment" placeholder="payment...">
              <label>stmnt_date</label><input type="date" v-model="newAccount.statement_date" placeholder="statement_date...">
          </div>
          <br><br>    
            <p>
              <input type="submit" value="Submit">  <button @click.prevent="account = null">Cancelxxx</button>
            </p>
        </form>
      </div><!-- end account-edit -->
  <!-- <div class="flex-container">
    <div class="flex-item" v-if="!account">
      <div class="item" @click="account = 'me'">One</div>
    </div>
    <div class="flex-item" v-if="account" >
      Account: {{account}}
      <div class="cancel-edit" @click="account = null">Cancel</div>
    </div>
  </div> -->
  </div>
</template>
<script>
  function copyObject(x){
      return JSON.parse(JSON.stringify(x))
    }
  function latest(accounts) {
    function removeZeros(a){
      return a.new_balance > 300 * 100; // nothing less than $200
    }
    console.log(`latest called acctfile len=${acctfile.length}`)
     var accountsObj = {}
     // acctfile is the offline account data from accounts-2019-2xxx.js
    acctfile.filter(removeZeros).forEach(function(a){
      if (!accountsObj[a.name]){
        accountsObj[a.name] = [a]
      } else {
        accountsObj[a.name].push(a)
      }
    })
    // console.log(`Account2:latest: accountsObj = ${JSON.stringify(accountsObj, null, 3)}`)
    var accts = []
   // debugger
    // var aobj = state.accountsObj
    for (var key in accountsObj){
      var len = accountsObj[key].length
      accts.push(accountsObj[key][len-1]) // get last account in each 
    }
    accts = accts.filter(m => {
      return (m.debttype == 'store') || (m.debttype == 'card')
    })
    // here we inject minimum percentage for each account
    accts.forEach((a) => {
      a.min_percent = parseFloat(((a.minimum / a.previous_balance)*100).toFixed(2))
    })
    accts.sort(function(a, b){
      var x = a.new_balance
      var y = b.new_balance
      return x - y
    })
    console.log(`latest called accts len=${accts.length}`)

    return accts
  }
  

 module.exports = {
// export default {
  // components: {
  //         'meeting-form': httpVueLoader('./meeting-form.vue'),
  //       },
 // props: ['account'],
   data: function() {
        return {
          today: new Date(),
          title: "Account",
          editing:false,
          adding:false,
          errors: [],
     //     editAccount: false,
          storeAccounts: null,
          account: null,
          blankAcct: {
              name: "test",
              number: "12345",
              previous_balance: 1000000,
              new_balance: 900000,
              minimum: 19900,
              datedue: 3,
              interest: 17500,
              limit: 1500000,
              debttype: "card",
              owner: "brian",
              purchases: 0,
              payment: 0,
              statement_date: "5/30/2019"
          },
          items: [
            {name:'Disc 1',  number: "1001",  previous_balance: 16201.11,  new_balance: 15988.33, minimum: 400.00,interest:301.22},
            {name:'Disc 2',  number: "1002",  previous_balance: 16201.11,  new_balance: 15988.33, minimum: 400.00,interest:301.22},
            {name:'Pennys',  number: "1003",  previous_balance: 16201.11,  new_balance: 15988.33, minimum: 400.00,interest:301.22},
            {name:'Sears',  number: "1004",  previous_balance: 16201.11,  new_balance: 15988.33, minimum: 400.00,interest:301.22},
          ]
        }
    },
    computed: {
      storeAccounts: function(){
             return this.$store.getters.latestAccounts
      },
      newAccount: function(){
          //  return JSON.parse(JSON.stringify(this.account))
          var entry = this.account
          var a = {}
        //  this.isselected = true
          a.name = entry.name
          a.number = entry.number
          a.previous_balance = entry.new_balance //entry.previous_balance
          a.new_balance = 0
        //  a.previous_balance = entry.previous_balance
          a.datedue = entry.datedue
          a.minimum = entry.minimum
          a.interest = entry.interest
          a.limit = entry.limit
          a.debttype = entry.debttype
          a.purchases = entry.purchases
          a.payment = entry.payment
          a.statement_date = entry.statement_date
          a.owner = entry.owner
       //   document.getElementById("datePicker").valueAsDate = new Date()
          a.statement_date = entry.statement_date.substr(0,10)
          console.log("statement date = " + a.statement_date)
      //    console.log("new account " + JSON.stringify(a, null, 4))
          return a
      },
      nextPayDay: function(){
        var sdate = new Date(this.account.statement_date)
        var month = (sdate.getMonth()+1)%12 + 1
        // (new Date().getMonth()+1)%12 + 1
        //var month = sdate.getMonth ()+ 1
        console.log("pay date is " + sdate.toDateString())
        return month
      },
      filteredAccounts: function(){
        var akount = this.$store.getters.latestAccounts
        console.log(`filteredAccounts: ${this.accounts}`)
        if (!akount) return []
       var sortKey = "datedue"
       var ex = ["__v","updated"]
      //  var ex = ["_id","__v","updated"]
      var filterKey = '' // this.filterKey && this.filterKey.toLowerCase()
      //var order = this.sortOrders[sortKey] || 1
      var accounts = akount
      // var accounts = this.accounts
   //   console.log(`filteredAccounts: accounts len = ${accounts.length}`)
     // if (filterKey) {r
      // debugger
      // this map function excludes key from the row object for each account
      // we don't want those keys edited
        accounts = accounts.map(row => {
          Object.keys(row).forEach(k => ex.indexOf(k) > -1 ? delete row[k] : true )
          return row
        })
        // accounts = accounts.filter(function (row) {
        //   Object.keys(row).forEach(k => ex.indexOf(k) > -1 ? delete obj[k] : console.log(`saved ${k}`)) 
        //   return !exclude.some(x => x == "_id")
          
        //   Object.keys(row).some(function (key) {
        //     return String(row[key]).toLowerCase().indexOf(exclude) > -1
        //     // return String(row[key]).toLowerCase().indexOf(filterKey) > -1
        //   })
        // })
     // }
      if (sortKey) {
        accounts = accounts.slice().sort(function (a, b) {
          a = a[sortKey]
          b = b[sortKey]
          return (a === b ? 0 : a > b ? 1 : -1) * 1
        })
      }
      return accounts
      }
    },
    methods: {
    //  editAccount(account){
    //     console.log(`submitAccount: ${JSON.stringify(account, null, 3)}`)
    //   },
    getAllAccounts(){
      this.$store.dispatch("loadAccounts")
      // var url = "http://localhost:3019/accounts"
      //   fetch(url)
      //     .then(response => response.json())
      //     .then(json => console.log(json))
    },
    addAccount(account){
    //  console.log(`addAccount: ${JSON.stringify(account, null, 3)}`)
     this.$store.dispatch("addAccount", this.newAccount)

    },
    editAccount(account){
      console.log(`editAccount: ${JSON.stringify(account, null, 3)}`)
     this.$store.dispatch("updateAccount", account)

    },
      submitAccount(account){
        console.log(`submitAccount: ${JSON.stringify(account, null, 3)}`)
        this.account = null;
        // var url = "/products"
        var url = "http://localhost:3019/accounts"
        console.log(`submitAcctount: url=${url}`)
      // debugger
        // fetch('https://jsonplaceholder.typicode.com/posts/1')
        // fetch(url)
        //   .then(response => response.json())
        //   .then(json => console.log(json))
      //  this.postData(url, account)

      },
      formSubmit:function(){
        // debugger
        var s1date = new Date(this.account.statement_date)
        var s2date = new Date(this.newAccount.statement_date)
        console.log("last   account date = " + s1date.toDateString())
        console.log("update account date = " + s2date.toDateString())
        console.log("formSubmit.............." + JSON.stringify(this.newAccount))
        console.log("no errors........................")
      //  post account
      // delete for testing
this.$store.dispatch("addAccount", this.newAccount)
        // this.postData('http://localhost:3019/api/account/', this.newAccount)
        //   .then(data => console.log(data)) // JSON from `response.json()` call
        //   .catch(error => console.error(error))
        this.isselected = false
        this.$emit('updated')
      },
      postData: function(url, data){
        // Default options are marked with *
        return fetch(url, {
            body: JSON.stringify(data), // must match 'Content-Type' header
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, same-origin, *omit
            headers: {
              'user-agent': 'Mozilla/4.0 MDN Example',
              'content-type': 'application/json'
            },
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, cors, *same-origin
            redirect: 'follow', // manual, *follow, error
            referrer: 'no-referrer', // *client, no-referrer
          })
          .then(response => response.json()) // parses response to JSON
          .then(json => console.log(json))
      },
      checkForm:function(e) {
        function fixit(n){
          if (n.indexOf(".") > -1){
            n = parseFloat((n * 100).toFixed())
          }
          return n
        }
     // debugger
      this.errors = [];
      console.log(`testing account edit = ${JSON.stringify(this.newAccount,null,3)}`)
      // // if (this.newAccount.minimum.indexOf(".") > -1){
      //   //   this.newAccount.minimum = parseFloat((this.newAccount.minimum * 100).toFixed())
      //   // }
      //   this.newAccount.minimum = fixit(this.newAccount.minimum)
      //   var oldMinimum = this.account.minimum
      // var newMinimum = this.newAccount.minimum
      // console.log(`oldMinimum: ${oldMinimum}  newMinimum: ${newMinimum}`)
      this.errors.push("Testing edit............for:" + this.newAccount.name);
     // debugger
      // for(var i in this.newAccount){
      //   if ((i == 'purchases') && (!this.newAccount[i]))        this.errors.push(`Check ${i}`)
      //   if ((i == 'payment') && (!this.newAccount[i]))        this.errors.push(`Check ${i}`)
      // }
      //   if(this.name && this.age && 
      //   this.previous_balance &&
      //   this.minimum &&
      //   this.datedue &&
      //   this.interest &&
      //   this.limit &&
      // ) return true;
        // if(!this.name) this.errors.push("Name required.");
        // if(!this.age) this.errors.push("Age required.");
        e.preventDefault();
        if (this.errors.length == 0){
          console.log("test out formSubmit***************")
         // this.formSubmit();
        }
        return false
    },
     
    },
    created(){
      //  debugger
       this.getAllAccounts()
      console.log("created account.vue")
      // get real copy of account
     // this.newAccount = JSON.parse(JSON.stringify(this.account))
                           
        // var accounts =  this.$store.state.accounts
        // var atlasAccounts =  this.$store.state.latestAccounts
        // console.log(`account2:created: latestAccounts ${atlasAccounts}`)
        // this.accounts = copyObject(latest(accounts)) 
       // this.$store.getters.latestAccounts
   //   this.accounts = accountfile // from accounts-2019-2xxx.js
      //this.account = this.accounts[0]

    }
}
</script>

<style>
.edit-button{
  border: 1px solid black;
  cursor: pointer;
  padding: 10px;
  float: right;
  font-size: 1.2em;
  display: flex;
  justify-content: center;
  align-content: center;
  border-radius: 10px;
}
  .account-container{
  background: burlywood;
  width: 100%;
  height: 100vh;
    
  }
  .control-container{
    display: flex;
  }
  .account-fields{
    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr) ) ;
    /* grid-template-columns: repeat(4, 1fr); */
    grid-gap: 10px;
  }
  .bkc-list,
  .bkc-detail{
    background: lightcoral;
    height: 100vh;
    margin: 5px;
    border: 1px solid black;
  }
  .bkc-list{
    width: 30%;
    height: 90vh;
    overflow-y: scroll;
  }

  .bkc-detail h1{
    /* grid-column: 1 / 5; */
  }
  .bkc-detail{
    padding: 50px;
    font-size: 0.8em;
    background: #aaa;
    border: 1px solid #888;
    box-shadow: 2px 2px #444;
  }
  .acct-props{
    background: rgb(216, 209, 209);
    border: 1px solid black;
    padding: 5px;
    border-radius: 5px;
  }
  .submit-edit,
  .cancel-edit,
  .bkc-list .item{
    border: 1px solid black;
    border-radius: 5px;
    background: red;
    color: white;
    margin: 5px;
    padding: 3px;
    /* width: 100px; */
    cursor: pointer;
  }
  .cancel-edit:hover,
  .bkc-list .item:hover{
    background: #eee;
    color: gray;
  }
  .cancel-edit{
     background: #aaa;
  }

  @media only screen and (max-width: 600px) {
      body {
        background-color: lightblue;
      }
       .bkc-list{
        width: 100%;
      }
      .account-layout{
        display: block;
        /* display: flex; */
        /* flex-direction: column; */
      }
      .account-list{
        display: none;
      }
    .form-labels{
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      /* grid-template-columns: 70px 150px 70px 150px; */
      width: 100%;
      padding: 5px;
      grid-gap: 2px;
    }
    }




.flex-container{
  background: burlywood;
  width: 100%;
  height: 100vh;
}
.flex-item{
  background: lightcoral;
  height: 50vh;
  margin: 5px;
  border: 1px solid black;
}
.flex-container {
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-flex-direction: row;
    -ms-flex-direction: row;
    flex-direction: row;
    -webkit-flex-wrap: wrap;
    -ms-flex-wrap: wrap;
    flex-wrap: wrap;
    -webkit-justify-content: flex-start;
    -ms-flex-pack: start;
    justify-content: flex-start;
    -webkit-align-content: stretch;
    -ms-flex-line-pack: stretch;
    align-content: stretch;
    -webkit-align-items: flex-start;
    -ms-flex-align: start;
    align-items: flex-start;
    }

.flex-item:nth-child(1) {
    -webkit-order: 0;
    -ms-flex-order: 0;
    order: 0;
    -webkit-flex: 0 0 100px;
    -ms-flex: 0 0 100px;
    flex: 0 0 100px;
    -webkit-align-self: auto;
    -ms-flex-item-align: auto;
    align-self: auto;
    }

.flex-item:nth-child(2) {
    -webkit-order: 0;
    -ms-flex-order: 0;
    order: 0;
    -webkit-flex: 1 0 auto;
    -ms-flex: 1 0 auto;
    flex: 1 0 auto;
    -webkit-align-self: auto;
    -ms-flex-item-align: auto;
    align-self: auto;
    }
</style>
