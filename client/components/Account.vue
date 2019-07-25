<template>
  <div id="account">
    <div class="account-layout">
      <div class="account-list">
        <div class="a-account" @click="account = blankAcct">new account....</div>
        <div class="a-account" v-for="(a, i) in accounts" :key="a._id" @click="account = a">
          {{ a.name}}
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
              <label>Name</label><input type="text" v-model="newAccount.name" placeholder="name..." required>
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
              <input type="submit" value="Submit">  <button @click.prevent="account = null">Cancel</button>
            </p>
        </form>
      </div><!-- end account-edit -->
    </div><!-- end account-layout -->
  </div>
</template>
<script>
  function copyObject(x){
      return JSON.parse(JSON.stringify(x))
    }
  function latest() {
    function removeZeros(a){
      return a.new_balance > 300 * 100; // nothing less than $200
    }
    console.log("latest called*************************")
     var accountsObj = {}
     // acctfile is the offline account data from accounts-2019-2xxx.js
    acctfile.filter(removeZeros).forEach(function(a){
      if (!accountsObj[a.name]){
        accountsObj[a.name] = [a]
      } else {
        accountsObj[a.name].push(a)
      }
    })
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
          errors: [],
          editAccount: false,
          account: null,
          blankAcct: {
              name: "",
              number: "",
              previous_balance: 0,
              new_balance: 0,
              minimum: 0,
              datedue: 0,
              interest: 0,
              limit: "",
              debttype: "",
              purchases: 0,
              payment: 0,
              statement_date: ""
          }
        }
    },
    computed: {
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
    },
    methods: {
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

        this.postData('http://localhost:3009/api/account/', this.newAccount)
          .then(data => console.log(data)) // JSON from `response.json()` call
          .catch(error => console.error(error))
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
          this.formSubmit();
        }
        return false
    },
     
    },
    created(){
      // debugger
      console.log("created account.vue")
      // get real copy of account
     // this.newAccount = JSON.parse(JSON.stringify(this.account))
        this.accounts = []//copyObject(latest()) // this.$store.getters.latestAccounts
   //   this.accounts = accountfile // from accounts-2019-2xxx.js
      //this.account = this.accounts[0]
    }
}
</script>
<style>
    *, *:before, *:after {
      box-sizing: border-box;
    }
    #account{
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .account-layout{
      display: flex;
      max-width: 800px;
    }
    .account-list{
      flex: 1;
      margin: 5px 10px;
      height: 80vh;
      overflow-y: scroll;
    }
    .account-edit{
      flex: 2;
      justify-self: center;
      padding: 20px;
      margin: 20px;
      border: 1px solid black;
      background: gainsboro;
      font-weight: 200;
      text-align: center;
    }
    .account-edit h1{
      /* color: red; */
      font-weight: 100;
    }
    .account-edit h3{
      /* color: red; */
      font-weight: 100;
      letter-spacing: 2px;
      padding-bottom: 5px;
      border-bottom: 1px solid red;
    }
    .a-account{
      background: yellow;
      border: 1px solid black;
      border-radius: 5px;
     box-shadow: 5px 5px #888888;
      padding: 3px;
      margin: 5px 10px;
      font-size: 0.6em;
      font-family: cursive;
      /* width: 220px; */
    }
    label {
      /* font-size: 1.4em; */
    }
    .form-labels{
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      /* grid-template-columns: 70px 150px 70px 150px; */
      width: 100%;
      padding: 15px;
      grid-gap: 5px;
    }
    .form-labels label{
      text-align: right;
    }
    @media only screen and (max-width: 600px) {
      body {
        background-color: lightblue;
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
</style>

