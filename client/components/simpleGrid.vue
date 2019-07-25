t/**
* Created by vouill on 11/13/17.
*/

<template>
  <div class="simple-grid">
    <div class="simple-intro">
    <h1>Simple Grid</h1>
    <table>
  <tr>
    <th>Income</th>
    <th>Snowball</th>
    <th>Minimum</th>
    <th>Extra Min</th>
  </tr>
  <tr>
    <td>{{income * 100 | currency}}</td>
    <td>{{snowball * 100 | currency}}</td>
    <td>{{maxMinium | currency}}</td>
    <td>{{minReducedTotal | currency}}</td>
  </tr>
    </table>
    </div>
      <div class="simple-list" v-if="accounts">
        <!-- <div class="item" @click="account = blankAcct, editing=!editing">new account....</div>
        <div class="item" @click="account = item" v-for="(item, index) in filteredAccounts" :key="index">{{ item.name }}</div> -->  
        <div class="control-table">
          <h2>Controls {{months}}</h2>
          <button @click="next">Month++</button>
          <h3>Snowball on {{snowballAccount}} reducing {{snowballTotal}}</h3>
        </div>
         <table class="hoverTable">
          <thead>
            <tr class="table-header">
              <th v-for="k in columns" :key="k"> {{ k }}  </th>
        
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in simpleAccounts" :key="entry.name">
              <td v-for="col in columns"  :key="col" 
              v-bind:class="{ zeroed: entry.bal == 0 && entry == 'name',snow: entry.snow && col== 'snow'}">
                {{entry[col]  | all  }}
              </td>
            
            </tr>
          </tbody>
        </table>
      </div>
  </div>
  </template>
  
  <style>
  .simple-intro{
    display: flex;
    justify-content: space-around;
  }
      .simple-list{
        display: flex;
        justify-content: space-around;
      }
      tr .snow{
        background: rgb(236, 149, 149);
        font-size: 16px;
        /* line-height: 800; */
        }
        table {
      border: 2px solid #42b983;
      border-radius: 3px;
      background-color: #fff;
    }

    th {
      background-color: #42b983;
      color: rgba(255,255,255,0.66);
      cursor: pointer;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }

    td {
      background-color: #f9f9f9;
    }

    th, td {
      /* min-width: 120px; */
      padding: 5px 10px;
    }
    tr:hover{
      background: red;
    }
    td{padding:0; border-spacing:0}
    th.active {
      color: #fff;
    }
    .control-table,
    .hoverTable{
      flex: 1;
    }
    .hoverTable{
      flex: 2;
    }
    .control-table{
      margin: 10px;
      padding: 20px;
      background: #bfd8f9;
    }
    .hoverTable td {
        padding: 2px;
        border-bottom: #4e95f4 1px solid;
    } 
</style>

<script>
function c(v){
     value = (v/100).toFixed(0)
        return (value * 1).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  }
 // import {AUTH_REQUEST} from 'actions/auth'
module.exports = {
// export default {
    name: 'simple',
     components: {
            'grid-data': httpVueLoader('../components/GridData.vue'),
          },
    data () {
      return {
         accounts: null,
         currentAccounts:null,
         futureAccounts: [],
         months: 0,
         excess: 0,
         minReducedTotal: 0,
         maxMinium: 0,
          searchQuery: 'iRate',
          snowball: 1400,
          snowballAccount: '',
          snowballTotal: 0,
          income: 0,
           columns: ['name', 'bal', 'min', 'snow'],
          //  gridColumns: ['name', 'previous_balance', 'new_balance', 'interest','new_int','rate', 'minimum','new_min','min_percent'],
      }
    },
    computed: {
      simpleAccounts: function(){
        var akount = this.currentAccounts
        // var akount = this.$store.getters.latestAccounts
        console.log(`filteredAccounts: ${this.accounts}`)
        if (!akount) return []
      //  akount = akount.map(this.determineRates )
   //     console.log(`rates determined ---  ${JSON.stringify(akount, null, 3)}`)
        var sortKey = this.searchQuery
         var ex = ["__v","updated"]
        var filterKey = '' // this.filterKey && this.filterKey.toLowerCase()
       var accounts = akount
        accounts = accounts.map(row => {
          var obj = {}
          obj.name = row.name
          obj.bal = row.new_balance
          obj.min = row.minimum
          obj.snow = row.snowball
          // Object.keys(row).forEach(k => ex.indexOf(k) > -1 ? delete row[k] : true )
          return obj
        })
      if (sortKey) {
        accounts = accounts.slice().sort(function (a, b) {
          a = a[sortKey]
          b = b[sortKey]
          return (a === b ? 0 : a > b ? 1 : -1) * 1
        })
      }
      return accounts
      },
 filteredAccounts: function(){
        var akount = this.$store.getters.latestAccounts
        console.log(`filteredAccounts: ${this.accounts}`)
        if (!akount) return []
       var sortKey = this.searchQuery
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
      next(){
        console.log('do next')
        // futureAccounts should hold first set
        var accts = this.futureAccounts[this.months++]
        // reduce balances
        var payoffRound = this.snowball * 100
        payoffRound += this.minReducedTotal
        var reducedMin = this.minReducedTotal = 0
        var accts = accts.map((a,i,accts)=>{ // old reduce balances
            if (a.iRate > 0){ // if 0 then pass
             // now figure new min balance
                var min = (a.new_balance * (a.min_percent/100))
                reducedMin += (a.minimum - min)
               console.log(`account reduced ---  ${a.name} index=${i} old_min = ${c(a.minimum)} new_min = ${c(min)}`)        
              var interest = (a.iRate / 12) * a.new_balance
              var reduced = min - interest + this.excess + payoffRound + this.minReducedTotal           
              // var reduced = a.minimum - interest + this.excess + payoffRound + this.minReducedTotal           
              if (payoffRound || this.excess){
                this.snowballAccount = a.name
                this.snowballTotal = c(reduced)
                a.snowball = this.snowballTotal
                // console.log(`snow: ${a.name}: bal: ${parseFloat((a.new_balance/100).toFixed(2))} reducing ${currreduced | currency}`)
                console.log(`snow: ${a.name}: bal: ${parseFloat((a.new_balance/100).toFixed(2))} reducing ${c(reduced)}`)
              }
              this.excess = payoffRound = 0
              if (reduced > a.new_balance+10000){
                // todo reset next account in the order


                this.excess += reduced - a.new_balance // next acct gets onetime payoff
                this.snowball += a.minimum/100
                console.log(`excess = ${parseFloat((this.excess/100).toFixed(2))} for ${a.name}`)
                this.runningPayoff += a.minimum  // running should increase by last min                      
               a.iRate = a.rate = a.minimum = a.purchases = a.interest = a.payment = a.new_balance = 0
                a.new_int = a.new_min = a.min_percent = 0
                console.log(`account expired ---  ${a.name} index=${i} running = ${this.runningPayoff}`)                   
              } else {
                a.new_balance -= reduced
                //a.minimum = min        
              }
            }
            return a
          },this)// reduce balances on all 
        // get new minimums 
        this.minReducedTotal = reducedMin
      console.log(`min reduced by ${c(reducedMin)}`)   
        this.currentAccounts = accts
             this.maxMinium = accts.reduce((a,b) => { 
                var min = (b.new_balance * (b.min_percent/100))
               return a + min},0)
      // accts = accts.map(a => {
      //   a.snowball = 0
      //   return a
      // })                
      this.futureAccounts.push(accts)

      },
       getAllAccounts(){
      this.$store.dispatch("loadAccounts")
      // var url = "http://localhost:3019/accounts"
      //   fetch(url)
      //     .then(response => response.json())
      //     .then(json => console.log(json))
     },
     determineRates(a){
              if (a.new_balance < 10000){ // if new_balance is less than $100 assume account is expired (rate = 0)
                a.rate = 0
              //   console.log(`account expired ---  ${JSON.stringify(a, null, 3)}`)
              } else {
                a.rate = ((a.interest * 12) /a.new_balance).toFixed(3)
                a.min_rate = parseFloat((a.minimum / a.new_balance).toFixed(2));
              }
              return a
      },
    },
   created(){
      // debugger
      console.log("created simpleGrid.vue")
      this.getAllAccounts()
      this.currentAccounts = this.accounts = this.$store.getters.latestAccounts
      this.futureAccounts.push(this.accounts)
      this.maxMinium = this.accounts.reduce((a,b) => { return a + b.minimum},0)
      this.income = this.$store.getters.totalIncome 
    },
      filters: {
    short: function (str) {
      return str.substr(0,12)
    },
    capitalize: function (str) {
      return str.charAt(0).toUpperCase() + str.slice(1)
    },
    currency: function(value){
        if (!value) return 0;
        var x =  parseFloat(value / 100).toFixed(0)
        return (+x).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })
        // return (value * 1).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
      },
      all: function(value){
        if (value instanceof Date){
          return value.toLocaleDateString()
        }
        if (typeof value === 'number'){
          // console.log('filter all numbers : ' + value)
          if (value < 100){
            return value
          }
          var x = parseFloat(value / 100).toFixed(0)
        //  console.log(`number:${x}`)
          // console.log('filter all numbers : ' + x)
          var y = (x * 1).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })
          // console.log('filter all currency numbers : ' + y)
          return (x * 1).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })// .split('.')[0];
          // return parseFloat(value / 100).toFixed(0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
        }
        if (typeof value === 'string') {
          // console.log('filter all strings : ' + value)
          if (value.indexOf("2019-") == 0){
            // debugger
            return new Date(value).toDateString()
          }
         return value // .substr(0,10)
      }
    //  debugger
      return value
    },
  },
  }
</script>
