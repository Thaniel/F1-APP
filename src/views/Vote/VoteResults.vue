<template>
  <div class="vote-results">
    <NavBar></NavBar>
    <div id="head">
      <h1 class="text-h4 text-md-h3 text-lg-h3 text-xl-h3">Gran Premio de {{ nombre_gp }} </h1>
    </div>
    <div id="container">
      <template v-for="v in votes">
        <v-hover :key="v.id">
          <v-flex  class="col-12 col-md-4 col-lg-4 col-xl-4">
            <v-card  class="mx-auto pa-0 ma-5" :id="v.codigo" elevation="6">
              <img height="250" :src="v.url_foto" id="image" alt="F1 Driver"/>
              <v-card-title class="text-h5 darken-3">{{v.nombre}}</v-card-title>
              <v-card-subtitle class="text-h5 ma-2 black--text">{{v.porcentaje}} %</v-card-subtitle>
            </v-card>
          </v-flex>
        </v-hover>
      </template>
    </div>
    <v-btn class="button white--text button_volver body-1" elevation="4" rounded  @click="backToAllvotes()">
      Volver
    </v-btn>
  </div>
</template>

<script>
import NavBar from "../../components/NavBar";
import * as fb_functions from "../../API/firebase";

export default {
  components: {NavBar},
  name: "VoteResults",
  data(){
    return {
      votes: [],
      nombre_gp: '',
      first_path: '',
      second_path: '',
      third_path: '',

      first_per: '',
      second_per: '',
      third_per: '',
    }
  },
  created() {
    this.nombre_gp = this.$route.query.name
    this.first_path = this.$route.query.first_path
    this.second_path = this.$route.query.second_path
    this.third_path = this.$route.query.third_path

    this.first_per = this.$route.query.first_percentaje
    this.second_per = this.$route.query.second_percentaje
    this.third_per = this.$route.query.third_percentaje

    let paths = []
    paths.push(this.first_path)
    paths.push(this.second_path)
    paths.push(this.third_path)

    let percentajes = []
    percentajes.push(this.first_per)
    percentajes.push(this.second_per)
    percentajes.push(this.third_per)

    this.votes = fb_functions.getPodium(paths, percentajes)
  },
  methods: {
    /**********************************************
     *
     * Go back to vote
     *
     *********************************************/
    // @vuese
    // Used to go back to the page of all votes
    backToAllvotes() {
      this.$router.push('/all-votes')
    },
  }
}
</script>

<style scoped>
@import "../../assets/styles/bottomContainer.css";

.vote-results{
  background-color: white;
  height: auto;
  text-align: center;
  margin-top: 48px;
}

#head{
  width: 100%;
  padding: 10% 10%;
  background-color: #D50000;
  display: inline-block;
  text-align: left;
  color: white;
}

#container{
  margin: 5%;
  margin-bottom: 40% !important;
}

img{
  width: 100%;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 90%);
  object-fit: cover;
  object-position: 100% 5%;
}

[class*="col"] {
  float: left;
}

.button_volver{
  background-color: #212121 !important;
  margin-top: 10%;
  margin-bottom: 10%;
  width: 45%;
}
h1, h2, h3, h4, h5, h6, p,
.text-h1, .text-h2, .text-h3, .text-h4, .text-h5, .text-h6,
.text-md-h1, .text-md-h2, .text-md-h3, .text-md-h4, .text-md-h5, .text-md-h6,
.text-lg-h1, .text-lg-h2, .text-lg-h3, .text-lg-h4, .text-lg-h5, .text-lg-h6,
.text-xl-h1, .text-xl-h2, .text-xl-h3, .text-xl-h4, .text-xl-h5, .text-xl-h6,
.body-1, .body-2{
  font-family: "F1 Regular" !important;
}
</style>