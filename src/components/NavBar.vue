<template>
  <div class="topnav" id="myTopnav">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">

    <router-link to="/home" class="active image">
      <img src="../assets/f1_white.png" alt="logo-app">
    </router-link>

    <router-link v-for="l in links" :key="l.text" :to="l.route">
      <v-icon medium class="material-icons hidden-md-and-up" color="white">{{ l.icon }}</v-icon>
      {{l.text}}
    </router-link>

    <a href="javascript:void(0);" class="icon" @click="resize()">
      <i class="fa fa-bars"></i>
    </a>
  </div>
</template>

<script>

export default {
  name: "NavBar",
  data(){
    return{
      links:[
        {icon: 'article', text:'News', route:'/news'},
        {icon: 'calendar_today', text:'Schedule', route:'/schedule'},
        {icon: 'directions_car', text: 'Teams', route:'/teams'},
        {icon: 'sports_motorsports', text:'Drivers', route:'/drivers'},
        {icon: 'forum', text: 'Forum', route:'/forum'},
        {icon: 'thumb_up', text:'Vote', route:'/vote'},
        {icon: 'emoji_events', text: 'Table', route:'/table'},
        {icon: 'account_circle', text:'Profile', route:'/profile'},
      ]
    }
  },
  methods: {
    // @vuese
    // Used to resize the navbar component based on the size of the device
    resize() {
      var x = document.getElementById("myTopnav");
      if (x.className === "topnav") {
        x.className += " responsive";
      } else {
        x.className = "topnav";
      }
    }
  }
}
</script>

<style scoped>
body {
  margin: 0;
  font-family: Arial, Helvetica, sans-serif;
}
img{
  height: 24px;
}
.image{
  padding: 14px 24px 8px 24px!important;
}

.topnav {
  z-index: 1;
  display: block;
  position: fixed !important;
  width: 100%;
  top: 0;
  overflow: hidden;
  background-color: #212121;
}

.topnav a {
  float: left;
  display: block;
  color: #f2f2f2;
  text-align: center;
  padding: 14px 24px;
  text-decoration: none;
  font-size: 17px;
}

.topnav a:hover {
  background-color: #515151;/*#ddd;*/
  color: white;/*#212121;*/
}

.topnav a.active{
  background-color: #212121;
  color: white;
}
.topnav a.active:hover {
  background-color: #D50000;
}

.topnav .icon {
  display: none;
}

@media screen and (max-width: 960px) {
  .topnav a:not(:first-child) {display: none;}
  .topnav a.icon {
    float: right;
    display: block;
  }
}

.v-icon{
  margin-right: 20px !important;
}
@media screen and (max-width: 960px) {
  .topnav.responsive {position: relative;}
  .topnav.responsive .icon {
    position: absolute;
    right: 0;
    top: 0;
  }
  .topnav.responsive a {
    float: none;
    display: block;
    text-align: left;
  }
}
</style>