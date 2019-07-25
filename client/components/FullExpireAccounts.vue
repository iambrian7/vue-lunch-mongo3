<template>
    <div id="full-expire-accounts">
      <!-- <h1>amexpBalance {{ msg }}</h1> -->
      <div class="step-it">
        <button class="step-through" @click="sail">Step Through</button>
        <div class="step-right">
          <div class="account-info">
            <span>Account: {{ snowballName }}</span>
            <!-- <p>Free: {{ minimumReduction | all }}</p> -->
            <h2>Tot: {{ total /100 | currency }} TotMin: {{totalMin | currency}} TotInt: {{totalInt | currency}} CashFlow: {{ cashFlow | currency}}</h2>
            <h2>Diff min: {{diffMin}}</h2>
          </div>
          <h1>Snowball {{ snowball }}</h1>
        </div>

      </div>
      <!-- <button @click="expireAllAccounts">expireAllAccounts</button> -->
      <button @click="testaccountone">test acct one</button>
      <button @click="setMonth(12)">One Year</button>
      <button @click="setMonth(24)">Two Year</button>
      <button @click="setMonth(36)">Three Year</button>
      <button @click="addMonth()">+ month</button>
      <button @click="resetAccount()">resetAccount</button>
      <input type="text" placeholder="initial snowball.........." v-model="initSnowball">
      <div class="future-accounts">
          <span class="future" v-for="(n, i) in futureAccts" :key="i" @click="predict(i+1)"
          v-bind:class="{ filled: i <= selectedAccount}"
          >{{ i+1 }} </span>
   
      </div>
      <form id="search">
          Search <input name="query" v-model="searchQuery">
        </form>
        <!-- <div class="table-data"> -->
          <grid-data
            :heroes="gridAccounts"
            :columns="gridColumns"
            :filter-key="searchQuery">
        <!-- </div> -->

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
    components: {
            'grid-data': httpVueLoader('./GridData.vue'),
          },
    props: {
      list: Array,
    },
     data: function() {
          return {
            msg: "FullExpireAccounts.vue",
            cashFlow: 0,
            accounts: [],
           // gridAccounts: [],
            searchQuery: '',
            gridColumns: ['name', 'previous_balance', 'new_balance', 'interest','new_int','rate', 'minimum','new_min','min_percent'],
            // gridColumns: ['name', 'statement_date', 'previous_balance', 'new_balance', 'interest','rate', 'minimum','min_percent'],
            futureAccts: [],
            snowball: 0,
            snowballName: '',
            snowballStore: [],
            initSnowball: 150000,
            runningPayoff: 150000,
            monthReduction: 0,
            smallestAccountIndex: null,
            smallestAccount: {
              name: "start",
              bal: 20000000,
              payoff: 50000
            },
            selectedAccount: -1,
            months: 3,
            excess: 0,
            total: 0,
            totalMin: 0,
            diffMin: 0,
            totalInt: 0,
            balArray:[]
          }
      },
      // watch: {
      //     gridColumns[10].new_balance: function (val) {
      //       this.fullName = val + ' ' + this.lastName
      //     },
      //     lastName: function (val) {
      //       this.fullName = this.firstName + ' ' + val
      //     }
      //   },
      //  watch : {
      //          gridAccounts : function (val) {
      //             this.kilometers = val/ 1000;
      //             this.meters = val;
      //          }
      //       },
      computed: {
        gridAccounts: function(){
        //  debugger
             return this.$store.getters.latestAccounts
      }
        // latestAccounts(){
        //   var newAcct
        //   console.log(`selectAccount = ${this.selectedAccount}`)
        //   if (this.selectedAccount < 0){
        //     newAcct = this.accounts
        //   } else {
        //     //Vue.set(newAcct, this.futureAccts[this.selectedAccount], 1);
        //     newAcct = this.futureAccts[this.selectedAccount]
        //   }
        //   Vue.set(newAcct[0], 'rate', 0)
        //   return newAcct
        // }
      },
      methods: {
        resetAccount(){
          this.futureAccts = []
          this.balArray = []
          this.totalBalances = this.total = this.snowball = 0
          this.runningPayoff = this.initSnowball * 1
          if (this.runningPayoff < 10000){
            this.runningPayoff = this.initSnowball * 100
          }
          this.accounts = this.$store.getters.latestAccounts
          // this.accounts = copyObject(latest()) // this.$store.getters.latestAccounts
          this.accounts.forEach((a,i) => {
            a.snowball = false;
          }, this)
          this.gridAccounts = copyObject(this.accounts)
          this.smallestAccountIndex = null
          this.selectedAccount = -1
          this.excess = 0
          this.cashFlow = 0;
        },
        addMonth(){
          this.months = 1
          // use the last futureAcct array for the next 
          var lastIndex = this.futureAccts.length - 1
          if (lastIndex < 0){
            this.accounts = this.$store.getters.latestAccounts
            // this.accounts = latest() // this.$store.getters.latestAccounts
            this.gridAccounts = copyObject(this.accounts)
          } else {
            this.accounts = copyObject(this.futureAccts[lastIndex])
          }

          this.expireAllAccounts()
        },
        setMonth(months){
          this.months = months
          this.runningPayoff = this.initSnowball * 1
          if (this.runningPayoff < 10000){
            this.runningPayoff = this.initSnowball * 100
          }
          this.expireAllAccounts()
        },
        testaccountone(){
          debugger
          console.time('quick')
          this.quick()
          console.timeEnd('quick')
        },
        sail(){
          if (this.selectedAccount < this.futureAccts.length-1){
              this.selectedAccount++
            this.predict(this.selectedAccount)
          //   this.selectedAccount++
          //    this.snowball = "$" + (this.snowballStore[this.selectedAccount]/100).toFixed(2)
          // this.gridAccounts = copyObject(this.futureAccts[this.selectedAccount])
          
          } else {
            alert("maxed out on the futureAccounts*****")
          }
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
          findSmall(accts){
            var x = null
            var smallest = 99999999
            accts.forEach((a) => { 
              if (a.new_balance < smallest && a.new_balance > 0){
                smallest = a.new_balance
                x = a
              }},this)
            if (x){
              if (x.minimum < this.runningPayoff){
                x.minimum += this.runningPayoff * 1
              }
              console.log(`smallest = ${x.name} with ${x.new_balance / 100}`)
            }  else {
              console.log(`done with all balances......................`)
            }
            return x
          },
        quick(){
          // create a set of accounts for each month that contains a balance in any account
         var tot = this.accounts.reduce((a,b) => { return a+b.new_balance},0)
          var accts = this.accounts.map(this.determineRates )
       //   debugger
          acctHistory = []
          var done = false
          var safe = 0
          var smallestAccount = null
          this.runningPayoff = this.initSnowball * 1
          acctHistory.push(this.accts)
          var newAccts = copyObject(accts)
          while(!done){
            smallestAccount = this.findSmall(newAccts)
            if (smallestAccount){
              newAccts = newAccts.map(this.reduceBalances)// reduce balances on all accounts
              acctHistory.push(newAccts)
            } else {
              console.log(`done with all accounts....${acctHistory.length}`)
              console.log(`${JSON.stringify(acctHistory[acctHistory.length-1], null, 3)}`)
              done = true
            }
            if (safe++ > 300) {
              console.log(`break from safe ${safe}`)
              break;
            }
          }
          console.log(`done with all accounts....${acctHistory.length}`)
          console.log(`${JSON.stringify(acctHistory[acctHistory.length-1], null, 3)}`)
          console.log(`done ${tot} in ${acctHistory.length} months`)
        },
        predict(i){
         // console.log(`do: ${i}`)
          this.selectedAccount = i
          this.total = this.balArray[i]
          var lastMin = this.futureAccts[i-1].reduce((a,b) => {
            var amt = parseFloat((b.new_balance * (b.min_rate / 100)).toFixed(2)) 
            return a + amt
          },0)
          this.totalMin = this.futureAccts[i].reduce((a,b) => {
            // var bal = parseFloat((b.new_balance / 100).toFixed(2)) 
            var amt = parseFloat((b.new_balance * (b.min_rate / 100)).toFixed(2)) 
            // var min = parseFloat((b.minimum / 100).toFixed(2)) 
            // var brate = parseFloat((b.min_rate).toFixed(2)) 
            // if (b.name == "Citi Brian"){
            //   console.log(`min = from ${min} to ${amt} for ${bal} in${b.name} minrate=${brate}`)
            // }
            return a + amt
          },0)
          var diffMin = (lastMin - this.totalMin)
          if (diffMin < 0)(
            alert("diff minus")
          )
          this.cashFlow += diffMin
          this.diffMin = (lastMin - this.totalMin).toFixed(2)

          console.log(`Total Min due: ${parseFloat((this.totalMin).toFixed(2)) } cash=${this.cashFlow.toFixed(2)}`)
         // console.log(`futureAccts length= ${this.futureAccts.length}`)
          this.totalInt = this.futureAccts[i].reduce((a,b) => {
            // var bal = parseFloat((b.new_balance / 100).toFixed(2)) 
          //  ((b.rate / 12) * a.new_balance) / 100
            var amt = parseFloat((((b.rate / 12) * b.new_balance) / 100).toFixed(2)) 
            // var min = parseFloat((b.minimum / 100).toFixed(2)) 
            // var brate = parseFloat((b.min_rate).toFixed(2)) 
            // if (b.name == "Citi Brian"){
            //   console.log(`min = from ${min} to ${amt} for ${bal} in${b.name} minrate=${brate}`)
            // }
            return a + amt
          },0)
          console.log(`Total Min due: ${parseFloat((this.totalInt).toFixed(2)) }`)
         // console.log(`futureAccts length= ${this.futureAccts.length}`)
          this.gridAccounts = copyObject(this.futureAccts[i])
          this.snowball = "$" + (this.snowballStore[i]/100).toFixed(2)
          var smallest = this.gridAccounts.filter((a) => {
            return a.snowball
          })
          // console.log(`account smallest ---  ${JSON.stringify(smallest, null, 3)}`)
          if (smallest.length > 0){

            this.snowballName = smallest[0].name
          // console.log(`snowball name=${this.snowballName}`)
          } else {
            alert("no snoball name for selectedAccount = " + this.selectedAccount)
          }
          // this.gridAccounts = Object.assign([],this.futureAccts[i])
          //this.accounts = this.futureAccts[i]
        },
        getTotalBalances(acct){
          return acct.reduce(function(a,b){
            return a + b.new_balance
          },0)
        },
        findSmallest(accts){
         // var sa = this.smallestAccount
          var lowestBalance = 200000000
          var smallestAccountIndex = null
          //sa.payoff = this.runningPayoff
          //  debugger

          accts.forEach((a,i) => {
            // if (a.previous_balance == 0){
            //   debugger
            //   a.new_balance = 0
            // }
            // reset all snowball flags to false
            a.snowball = false;
            if (a.new_balance > 10000 && a.new_balance < lowestBalance){
              lowestBalance = a.new_balance
              smallestAccountIndex = i
              // console.log(`new lowest account = ${a.name} with ${a.new_balance} index= ${i} minimum= ${a.minimum}`)
            }
           // this.smallestAccount.bal = lowestBalance
           // this.smallestAccount.name = smallestAccount
          }, this)
    if (smallestAccountIndex == null){
      debugger
      return null
    }
          var a = accts[smallestAccountIndex]



          if (!this.smallestAccountIndex || this.smallestAccountIndex != smallestAccountIndex){ // still the same smallest?
            this.smallestAccountIndex = smallestAccountIndex
            var bal = accts[smallestAccountIndex].new_balance 
            var name = accts[smallestAccountIndex].name 


            // if (this.excess){
            //   if (bal >= this.excess){
            //     accts[smallestAccountIndex].new_balance -= this.excess
            //     console.log(`drained excess = $${(this.excess/100).toFixed(2)}`)
            //     this.excess = 0 // ecess is drained because it was totally reduced new_balance
            //   } else {
            //     console.log(`drained balance for ${name} = $${(this.excess/100).toFixed(2)}`)
            //     this.excess -= bal
            //     accts[smallestAccountIndex].new_balance = 0
            //   // now what do we do with a zero balance smallestAccount ????
            //   }
            // }

            this.runningPayoff += accts[smallestAccountIndex].minimum 
            accts[smallestAccountIndex].minimum = this.runningPayoff
           // console.log(`account smallest ---  ${JSON.stringify(accts[smallestAccountIndex], null, 3)}`)
            // snowballStore todo
            a.snowball = true
          }
          return this.smallestAccountIndex

        },
        reduceBalances(a,i,accts){
          if (a.snowball){
            console.log(`Snowball is ${a.name} bal=${(a.new_balance/100).toFixed(2)} min=${(a.minimum/100).toFixed(2)}`)
          }
          if (a.rate > 0){
            var interest = (a.rate / 12) * a.new_balance
            var reduced = a.minimum - interest
            if (reduced > a.new_balance){
              // debugger
               this.excess += reduced
               this.excess -= a.new_balance
               console.log(`excess = ${parseFloat((this.excess/100).toFixed(2))} for ${a.name}`)
              a.new_balance = 0
            } else {
              a.new_balance -= reduced
            }
            if (a.new_balance < 10000){
              a.rate = a.minimum = a.purchases = a.interest = a.payment = a.new_balance = 0
              a.new_int = a.new_min = a.min_percent = 0
              console.log(`account expired ---  ${a.name}`)
              // console.log(`account expired ---  ${JSON.stringify(a, null, 3)}`)
              this.findSmallest(accts)
            } else 
            {
              // calc new minimum
              var min = a.new_balance * a.min_rate
              //a.minimum = min            }
               a.new_min = min    
               a.new_int = interest
              // this.excess += a.minimum - a.new_min   
            }
          }
          return a
        },
        initAll(){

        },
       expireAllAccounts(){
         var monthReduction = 0
         if (this.months > 1){
           this.futureAccts = []  
           this.snowballStore = []
         } // if more than 1 month
         //debugger
         this.totalBalances = this.getTotalBalances(this.accounts)
         var accts = this.accounts.map((a) => {
           if (a.new_balance < 10000){ // if new_balance is less than $100 assume account is expired (rate = 0)
             a.rate = 0
           } else {
             a.rate = ((a.interest * 12) /a.new_balance).toFixed(3)
             a.min_rate = parseFloat((a.minimum / a.new_balance).toFixed(4));
           }
           return a
         })
        this.findSmallest(accts)
    


        for(var i=0; i<this.months; i++){
          var newAcct = accts.map(this.reduceBalances)// reduce balances on all accounts
          this.balArray[i] = this.getTotalBalances(newAcct)
          console.log(`bal for ${i} is ${this.balArray[i]}`)
          this.snowballStore.push(this.runningPayoff)
          this.futureAccts.push(newAcct)
          accts = copyObject(newAcct)
          this.MonthInfo(accts, i)
         } // end for months loop
       },
       MonthInfo(accts, i){
          console.log(`pass ${i} -----------------------------------------------------------------`)
          var zeroed = this.futureAccts[i].filter((a) => {
            return a.new_balance < 20000
          })
          console.log(`${zeroed.length} accounts zeroed in ${i} months`)
          var snowball = 0
          var snowballBal = 0
          zeroed.forEach((a) => {
            snowball += a.minimum
            snowballBal += a.previous_balance 
           // console.log(`zeroed ---  ${a.name} - ${a.previous_balance} snowball = ${snowball/100} snowballBal = ${snowballBal/100}`)
          })
          totalBalance = 0
          totalBalanceFuture = 0
          var reduced = this.futureAccts[i].filter((a) => {
            return a.new_balance > 20000
          })
          console.log(`${reduced.length} accounts reduced in ${i} months`)
          accts.forEach((a) => {
            if (a.new_balance > 10000){
              totalBalance += a.previous_balance
              totalBalanceFuture += a.new_balance 
            //  console.log(`reduced ---  ${a.name} - ${a.previous_balance/100} - ${a.new_balance/100} tot = ${totalBalance/100} totFuture = ${totalBalanceFuture/100}`)
            }
          })
       }
      },
      created(){
       // debugger
       this.$store.dispatch("loadAccounts")
        console.log("created FullExpireAccounts.vue")
        this.accounts = this.$store.getters.latestAccounts
        // this.accounts = copyObject(latest()) 
        // this.gridAccounts = Object.assign([],this.accounts) // get separate copy
        this.gridAccounts = copyObject(this.accounts)
       // console.log(`retrieved accounts (newAccounts) ${newAccounts.length}`)
      },
      filters: {
    all: function(value){
      if (value instanceof Date){
        return value.toLocaleDateString()
      }
      if (typeof value === 'number'){
        return parseFloat(value / 100).toFixed(0);
      }
      if (typeof value === 'string') {
       // console.log('filter all strings : ' + value)
         return value.substr(0,10)
      }
    //  debugger
      return value
    },
    monthname: function (value) {
      if (!value) return ''
      // value = value.toString()
      return MONTH_NAMES[value-1 ].substr(0,3)
    },
    dayname: function(value){
      var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      var valueName = app.$data.today.getDate() - value;
      var result = new Date(app.$data.today)
      result.setDate(result.getDate() + valueName)
      return days[result.getDay()].substr(0,1)
    },
    capitalize: function (str) {
          return str.charAt(0).toUpperCase() + str.slice(1)
        },
    currency: function(value){
        if (!value) return 0;
        value = value.toFixed(0)
        return (value * 1).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
      }
    },
  }
  </script>
  <style>
  #full-expire-accounts{
    max-width: 900px;
    margin: 20px auto;
    padding: 10px;
    font-size: 10px;
  }
  #search{
    max-width: 700px;
  }
  .table-data{
    max-width: 700px;

  }
  .step-right h1{
    padding: 10px;
  }
  .step-it{
    display: flex;
  }
  .step-it span{
    font-size: 2em;
      padding: 5px;
      margin: 5px;
  }
    .step-through{
      font-size: 2em;
      padding: 5px;
      margin: 5px;
    }
    .account-info{
      font-size: 0.6em;
      color: #444;
      letter-spacing: 3px;
      font-weight: 100;
    }
    .filled{
      background: red;
    }
    .future-accounts{
      display: flex;
      flex-wrap: wrap;
    }
    .future{
      flex: 0 0 30px;
      /* background: lightgreen; */
      border: 1px solid black;
      border-radius: 5px;
      /* font-size: 2em; */
      /* margin: 2px 5px; */
      padding: 2px;
    }
  </style>
  
  