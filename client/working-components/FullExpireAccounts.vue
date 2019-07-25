<template>
    <div id="full-expire-accounts">
      <!-- <h1>amexpBalance {{ msg }}</h1> -->
      <div class="test-expire">
        Test Expire
      </div>
      <div class="step-it">
        <div class="step-left">
          <h3>Snowball {{ snowball }}</h3>
          <button class="step-through" @click="sail">Step Through {{ getFutureDate(monthsPaid) }}</button>
        </div>
        <div class="step-right">
          <div class="account-info">
            <span>Account: {{ snowballName }}</span>
            <!-- <p>Free: {{ minimumReduction | all }}</p> -->
            <h2>Tot: {{ total /100 | currency }} TotMin: {{totalMin | currency}} </h2>
            <h2>Diff min: {{diffMin}} TotInt: {{totalInt | currency}} CashFlow: {{ cashFlow | currency}}</h2>
          </div>
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
          <span class="future" v-for="(n, i) in futureAccts" :key="i" @click="predict2(i+1)"
          v-bind:class="{ filled: i <= selectedAccount}"
          >{{ dateIndex(i+1)}} </span>
   
      </div>
      <form id="search">
          Search <input name="query" v-model="searchQuery">
        </form>
        <!-- <div class="table-data"> -->
          <grid-data
            :heroes="currentAccountsView"
            :columns="gridColumns"
            :filter-key="searchQuery">
        <!-- </div> -->

    </div>
  </template>
  <script>
   function c(v){
     value = (v/100).toFixed(0)
        return (value * 1).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  }
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
            'grid-data': httpVueLoader('../components/GridData.vue'),
          },
    props: {
      list: Array,
    },
     data: function() {
          return {
            msg: "FullExpireAccounts.vue",
            currentDate: new Date(),
            cashFlow: 0,
            accounts: [],
            gridAccounts: [],
            searchQuery: '',
            gridColumns: ['name', 'previous_balance', 'new_balance', 'interest','new_int','rate', 'minimum','new_min','min_percent'],
            // gridColumns: ['name', 'statement_date', 'previous_balance', 'new_balance', 'interest','rate', 'minimum','min_percent'],
            futureAccts: [],
            snowball: 0,
            snowballName: '',
            snowballStore: [],
            initSnowball: 1000,
            runningPayoff: 50000,
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
            balArray:[],
            monthsPaid: 0
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
      computed: {
        yearView(){
          // space out years into months
          var years = []
          // get first month
          var d = new Date()
          var y = d.getFullYear()
          var m = d.getMonth()
          var grid = this.gridAccounts
          return grid
        },
        currentAccountsView(){
          // var grid = this.$store.getters.latestAccounts
          var grid = this.gridAccounts
          return grid
        },
        latestAccounts(){
          var newAcct
          console.log(`selectAccount = ${this.selectedAccount}`)
          if (this.selectedAccount < 0){
            newAcct = this.accounts
          } else {
            //Vue.set(newAcct, this.futureAccts[this.selectedAccount], 1);
            newAcct = this.futureAccts[this.selectedAccount]
          }
          Vue.set(newAcct[0], 'rate', 0)
          return newAcct
        },
        monthsDone(){

        }
      },
      methods: {
        resetAccount(){
          this.futureAccts = []
          this.balArray = []
          this.totalBalances = this.total = this.snowball = this.months = 0
          this.runningPayoff = this.initSnowball * 100
          if (this.runningPayoff < 10000){
            this.runningPayoff = this.initSnowball * 100
          }
          // this.accounts = latest() // this.$store.getters.latestAccounts
          this.accounts = copyObject(latest()) // this.$store.getters.latestAccounts
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
            this.accounts = latest() // this.$store.getters.latestAccounts
            this.gridAccounts = copyObject(this.accounts)
          } else {
            this.accounts = copyObject(this.futureAccts[lastIndex])
          }

          this.expireAllAccounts()
        },
        setMonth(months){
          this.months = months
          this.monthsPaid = months
          this.runningPayoff = this.initSnowball * 100
          if (this.runningPayoff < 10000){
            this.runningPayoff = this.initSnowball * 100
          }
          this.expireAllAccounts()
        },
        testaccountone(){
          debugger
          console.time('quick2')
          this.quick2()
          console.timeEnd('quick2')
        },
        sail(){
          // if (this.selectedAccount > this.futureAccts.length)
          if (this.selectedAccount < this.futureAccts.length-1){
              this.selectedAccount++
            this.predict2(this.selectedAccount)
          //   this.selectedAccount++
          //    this.snowball = "$" + (this.snowballStore[this.selectedAccount]/100).toFixed(2)
          // this.gridAccounts = copyObject(this.futureAccts[this.selectedAccount])
          
          } else {
            debugger
            this.addMonth()
            this.predict2(this.selectedAccount++)
            // alert("maxed out on the futureAccounts*****")
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
          setInterestRates(a){
            return a.iRate = parseFloat((a.interest / a.new_balance).toFixed(2));
          },
          quickReduce(a){
            if (a.rate > 0){
                var interest = (a.rate / 12) * a.new_balance
                var reduced = a.minimum - interest + this.excess
                this.excess = 0
                if (reduced > a.new_balance){
                  // debugger
                    this.excess += reduced - a.new_balance
                    // this.excess -= a.new_balance
                    console.log(`excess = ${parseFloat((this.excess/100).toFixed(2))} for ${a.name}`)
                  a.new_balance = 0
                  this.runningPayoff += a.oldmin  // running should increase by last min                      
                } else {
                  a.new_balance -= reduced
                }
                if (a.new_balance < 10000){
                
                  a.rate = a.minimum = a.purchases = a.interest = a.payment = a.new_balance = 0
                  a.new_int = a.new_min = a.min_percent = 0
                  console.log(`account expired ---  ${a.name} index=${i}`)                   
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
        quick2(){
          // create a set of accounts for each month that contains a balance in any account
         var tot = this.accounts.reduce((a,b) => { return a+b.new_balance},0)
          // var accts = this.accounts.map(this.setInterestRates ).sort((a,b) => {
          //   var x = a.iRate//new_balance
          //   var y = b.iRate//new_balance
          //   return x - y
          // })
          var accts = this.accounts.map(this.determineRates )
       //   debugger
          acctHistory = []
          var done = false
          var safe = 0
          var smallestAccount = null
          this.runningPayoff = this.initSnowball * 100
          acctHistory.push(accts)
          // acctHistory.push(this.accts)
          var newAccts = copyObject(accts)
          this.excess = 0
          var months = 0, payoffRound = this.runningPayoff
        var TotalPayoff = this.runningPayoff + newAccts.reduce((a,b)=>  a + b.minimum,0)
        console.log(`TotalPayoff: ${c(TotalPayoff)}`)
   debugger
   // first set all minimums
      // var t1 = newAccts.map(x => x)
      while(newAccts.reduce((a,b) => { return a+b.new_balance},0)){
        // get total payoff ( snowball + all minimums)

         payoffRound = this.runningPayoff // first non-zero account get extra
          var accts = newAccts.map((a,i,accts)=>{ // old reduce balances
            if (a.rate > 0){ // if 0 then pass
              var interest = (a.rate / 12) * a.new_balance
              var reduced = a.minimum - interest + this.excess + payoffRound            
              if (payoffRound){
                // console.log(`snow: ${a.name}: bal: ${parseFloat((a.new_balance/100).toFixed(2))} reducing ${currreduced | currency}`)
                console.log(`snow: ${a.name}: bal: ${parseFloat((a.new_balance/100).toFixed(2))} reducing ${c(reduced)}`)
              }
              this.excess = payoffRound = 0
              if (reduced > a.new_balance+10000){
                this.excess += reduced - a.new_balance // next acct gets onetime payoff
                console.log(`excess = ${parseFloat((this.excess/100).toFixed(2))} for ${a.name}`)
                this.runningPayoff += a.minimum  // running should increase by last min                      
                a.rate = a.minimum = a.purchases = a.interest = a.payment = a.new_balance = 0
                a.new_int = a.new_min = a.min_percent = 0
                console.log(`account expired ---  ${a.name} index=${i} running = ${this.runningPayoff}`)                   
              } else {
                a.new_balance -= reduced
             //   console.log(`account reduced ---  ${a.name} index=${i} new_bal = ${a.new_balance}`)                   
              }
            }
            return a
          },this)// reduce balances on all 
        var TotalPayoff2 = this.runningPayoff + newAccts.reduce((a,b)=>  a + (b.new_balance * b.min_rate),0)
        console.log(`TotalPayoff2: ${c(TotalPayoff2)}`)
          acctHistory.push(accts)
        console.log(`could add to payoff: ${c(TotalPayoff - TotalPayoff2)} in ${acctHistory.length} months`)
          // this.futureAccts.push(newAccts)
          this.$set(this.futureAccts,months, accts)
          months++
          newAccts = copyObject(accts)
          // this.futureAccts.$set(months++, newAccts)
          // this.futureAccts[months++] = newAccts
            this.balArray.push(this.getTotalBalances(newAccts))
          // console.log(`bal for ${i} is ${this.balArray[i]}`)
          this.snowballStore.push(this.runningPayoff)
          this.MonthInfo(newAccts,  this.futureAccts.length-1)
        }
      console.log(`done with all accounts....${acctHistory.length}`)
      console.log(`done with all futureAccts....${this.futureAccts.length}`)
      // console.log(`${JSON.stringify(acctHistory[acctHistory.length-1], null, 3)}`)
      console.log(`done ${tot} in ${acctHistory.length} months`)
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
          this.runningPayoff = this.initSnowball * 100
          acctHistory.push(accts)
          // acctHistory.push(this.accts)
          var newAccts = copyObject(accts)
          while(!done){
            //find first acct with non-zero balance

            smallestAccount = this.findSmall(newAccts)
            if (smallestAccount){
              newAccts = newAccts.map(this.reduceBalances)// reduce balances on all accounts
              acctHistory.push(newAccts)
            } else {
              console.log(`done with all accounts....${acctHistory.length}`)
           //   console.log(`${JSON.stringify(acctHistory[acctHistory.length-1], null, 3)}`)
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
       dateIndex(value){
      var old = new Date(this.currentDate)
          var d = new Date(old.setMonth(old.getMonth() + value));    
      return d.getMonth()+1 + '/' +d.getFullYear()
    },
    getFutureDate(n){
      var old = new Date(this.currentDate)
      var d = new Date(old.setMonth(old.getMonth() + n));    
  //    var d = (startDate.getMonth()+i)%12 + 1
      console.log(`new date = ${d.toLocaleString()} `)
      // var d = (new Date().getMonth()+1)%12 + 1
      return d.toLocaleDateString()
    },
     predict(i){
        this.selectedAccount = i
        this.monthsPaid = i
        this.total = this.balArray[i]
        var lastMin = 0
        if (i > 0){
          var fa = this.futureAccts[i-1]
          var lastMin = this.futureAccts[i-1].reduce((a,b) => {
              var amt = parseFloat((b.new_balance * (b.min_rate / 100)).toFixed(2)) 
              return a + amt
            },0)
        }
        this.totalMin = this.futureAccts[i].reduce((a,b) => {
          var amt = parseFloat((b.new_balance * (b.min_rate / 100)).toFixed(2)) 
          return a + amt
        },0)
        var diffMin = (lastMin - this.totalMin)
        if (diffMin < 0)(
          diffMin = 0
        )
        this.cashFlow += diffMin
        this.diffMin = diffMin.toFixed(2)
        this.totalInt = this.futureAccts[i].reduce((a,b) => {
          var amt = parseFloat((((b.rate / 12) * b.new_balance) / 100).toFixed(2)) 
          return a + amt
        },0)
        this.gridAccounts = copyObject(this.futureAccts[i])
        this.snowball = "$" + (this.snowballStore[i]/100).toFixed(2)
        var smallest = this.gridAccounts.filter((a) => { // find only true snowball
          return a.snowball
        })
        if (smallest.length > 0){
          this.snowballName = smallest[0].name
        } else {
          alert("no snoball name for selectedAccount = " + this.selectedAccount)
        }
    },
     predict2(i){
    //   debugger
        this.selectedAccount = i
        this.monthsPaid = i
        this.total = this.balArray[i]
        var lastMin = 0
        if (i > 0){
          var fa = this.futureAccts[i-1]
          var lastMin = this.futureAccts[i-1].reduce((a,b) => {
            var amt = parseFloat((b.new_balance * (b.min_rate / 100)).toFixed(2)) 
              return a + amt
            },0)
        }
        this.totalMin = this.futureAccts[i].reduce((a,b) => {
          var amt = parseFloat((b.new_balance * (b.min_rate / 100)).toFixed(2)) 
          return a + amt
        },0)
        var diffMin = (lastMin - this.totalMin)
        if (diffMin < 0)(
          diffMin = 0
        )
        this.cashFlow += diffMin
        this.diffMin = diffMin.toFixed(2)
        this.totalInt = this.futureAccts[i].reduce((a,b) => {
          var amt = parseFloat((((b.rate / 12) * b.new_balance) / 100).toFixed(2)) 
          return a + amt
        },0)
        this.gridAccounts = copyObject(this.futureAccts[i])
        this.snowball = "$" + (this.snowballStore[i]/100).toFixed(2)
        // var smallest = this.gridAccounts.filter((a) => { // find only true snowball
        var smallest = this.gridAccounts.find((a,index) => { // find only true snowball
          console.log(`predict2:find first > 0: ${a.name} ${index}`)
          return a.new_balance > 0//a.snowball
        })
        if (typeof smallest !== 'undefined'){
          this.snowballName = smallest.name
        } else {
          var doneMonth = this.futureAccts.length + 1
          this.snowballName = `All accounts zero in ${doneMonth} months`
          
        }
        // if (smallest.length > 0){
        // } else {
        //   alert("no snoball name for selectedAccount = " + this.selectedAccount)
        // }
    },
    getTotalBalances(acct){
      return acct.reduce(function(a,b){
        return a + b.new_balance
      },0)
    },
    findSmallest(accts){
      var lowestBalance = 200000000
      var smallestAccountIndex = null
      accts.forEach((a,i) => {
        a.snowball = false;
        if (a.new_balance > 10000 && a.new_balance < lowestBalance){
          lowestBalance = a.new_balance
          smallestAccountIndex = i
        }
      }, this)
      if (smallestAccountIndex == null){
  //      debugger
        return null
      }
      var a = accts[smallestAccountIndex]
      if (!this.smallestAccountIndex || this.smallestAccountIndex != smallestAccountIndex){ // still the same smallest?
        this.smallestAccountIndex = smallestAccountIndex
        var bal = accts[smallestAccountIndex].new_balance 
        var name = accts[smallestAccountIndex].name 
        this.runningPayoff += accts[smallestAccountIndex].minimum 
        accts[smallestAccountIndex].minimum = this.runningPayoff
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
          console.log(`account expired ---  ${a.name} index=${i}`)
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
         if (this.accounts.length == 0){
           this.accounts = this.$store.getters.latestAccounts
         }
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
        console.log("created FullExpireAccounts.vue")
        this.$store.dispatch("loadAccounts").then(() => {
          this.accounts = this.$store.getters.latestAccounts
              console.log("recieved accounts....")
                // this.initData();
              this.gridAccounts = copyObject(this.accounts)
        })
        // this.accounts = copyObject(latest()) // this.$store.getters.latestAccounts
        // this.gridAccounts = Object.assign([],this.accounts) // get separate copy
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
      return 
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
  .test-expire{
    font-size: 8px;
  }
  #full-expire-accounts{
    max-width: 900px;
    margin: 0 auto;
    padding: 5px;
  }
  #search{
    max-width: 700px;
  }
  .table-data{
    max-width: 700px;

  }
  .step-left h3{
    padding: 2px;
    margin: 0 auto;
    text-align: center;
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
  
  