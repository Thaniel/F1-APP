<template>
  <v-app id="app">
    <v-main>
      <!--<transition name="fade" mode="out-in">-->
      <router-view/>
      <!--</transition>-->
    </v-main>
  </v-app>
</template>

<script>

export default {
  name: 'App',
  components: {
   // HelloWorld,
  },

  data: () => ({
    //
  }),
};
</script>

<style>
#app {
  font-family: F1 Regular, Roboto, Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  background-color: white !important;
}
body{
  /*background-color: #2D2828 !important;*/
  /*background: rgb(0,0,0);
  background: linear-gradient(0deg, rgba(0,0,0,1) 43%, rgba(81,0,0,1) 82%, rgba(255,0,0,1) 100%);*/
  /*margin: 0px;*/
  background-color: white !important;
}
#nav {
  padding: 30px;
}
#nav a {
  font-weight: bold;
  color: #2c3e50;
}
#nav a.router-link-exact-active {
  color: #42b983;
}

@font-face {
  font-family: "F1 Regular";
  src: local("F1 Regular"),
  url(fonts/Regular/Formula1-Regular.ttf) format("truetype");
}
@font-face {
  font-family: "F1 Black";
  src: local("F1 Black"),
  url(fonts/Black/Formula1-Black.ttf) format("truetype");
}
@font-face {
  font-family: "F1 Bold";
  src: local("F1 Bold"),
  url(fonts/Bold/Formula1-Bold.ttf) format("truetype");
}
@font-face {
  font-family: "F1 Wide";
  src: local("F1 Wide"),
  url(fonts/Wide/Formula1-Wide.ttf) format("truetype");
}
</style>