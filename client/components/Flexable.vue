<template>
  <div id="flexable-nav">
    <div class="header">
   <div class="navbar-top">   
    <nav class="links" id="myLinks" v-bind:class="{ responsive: resp }" @click="resp = !resp">
         <router-link v-for="item in items" :key="item.title" :to="item.path">{{item.title}}</router-link>
         <a href="vueform.html">VueFormGenerator</a>
    </nav>
    </div>
  </div> 
    <div class="spacer-top"></div>
  </div>
</template>

<script>
module.exports = {
  name: 'flexablenav',
  props: ['items'],
  data () {
    return {
      resp: false
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
*{
     padding: 0px;
     margin: 0px;
     box-sizing: border-box;
   }
   /* #good-nav:first-of-type + div {
      color: red;
      margin-top: 40px;
    } */
    /* .router-link-exact-active{
      background: yellow;
    } */
   .header{
     width: 100%;
     /* height: 1000px; */
     background-image: url(../images/clouds01.jpg);
     background-size: cover;
      background-position: fixed;
   }
    .spacer-top{
      height: 38px;
      background: blue;
      width: 50vw;
    }
   .navbar-top{
     width: 100%;
     /* padding: 20px; */
     position: fixed;
     top: 0px;
     transition: .5s;
     text-align: center;
     background: black;
    /* margin-bottom: 40px; */
   }
    .navbar-top{
     border-radius: 10px;
     background: rgba(0, 0, 255, 0.205);
     border: 1px solid blue;
   }
   .navbar-top a  {
     /* list-style-type: none; */
     display: inline-block;
     padding: 10px 50px;
     color: white;
     /* font-size: 24px; */
     font-family: sans-serif;
     text-decoration: none;
     /* cursor: pointer; */
     transition: .5s;
   }
   .navbar-top ul li:hover{
     background: orange;
   }
   .box {
     width: 80%;
     height: 2000px;
     background: green;
     margin: 20px auto;
   }
   ul.links li.icon {display: none; color: white;}
   /* media Queries */
    .router-link-exact-active  {
      background-color: rgb(51, 171, 40);
    }
@media screen and (max-width:680px) {
  ul.links li:not(:first-child) {display: none;}
  ul.links li.icon {
    float: right;
    display: inline-block;
  }
}
/* new class responsive */
@media screen and (max-width:680px) {
  .navbar-top{
    background: black;
  }
  ul.links.responsive {position: relative;}
  ul.links.responsive li.icon {
    position: absolute;
    right: 0;
    top: 0;
  }
  ul.links.responsive li {
    float: none;
    display: inline;
  }
  ul.links.responsive li {
    display: block;
    text-align: left;
  }
}
</style>
