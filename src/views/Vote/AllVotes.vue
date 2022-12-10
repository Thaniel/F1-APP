<template>
  <div class="allVotes">

    <v-snackbar v-model="snackbar_err" top :multi-line=true color="error"> Votación en curso
      <template v-slot:action="{ attrs }">
        <v-btn color="white" text v-bind="attrs" @click="snackbar_err = false" style="text-decoration: underline">
          Aceptar
        </v-btn>
      </template>
    </v-snackbar>
    <NavBar></NavBar>

    <v-card id="allVotes_container" elevation="4" >
      <div class="header">
        <h1 class="text-h4 text-md-h3 text-lg-h3 text-xl-h3 white--text">Todas la votaciones</h1>
      </div>
      <div class="pa-5">
        <template v-for="v in all_votes">
          <v-hover v-slot="{ hover }" :key="v.id" >
            <v-card class="mx-auto vote_container col" :id="v.estado" :elevation="hover ? 24 : 4" :class="{ 'on-hover': hover }" @click="showResults(v.id, v.estado)">
              <v-layout>
                <v-col class="pa-0">
                  <v-card-title>GP de {{v.nombre_gp}}</v-card-title>
                  <v-card-text>{{v.fecha}}</v-card-text>
                </v-col>
              </v-layout>
            </v-card>
          </v-hover>
        </template>
        <v-btn class="button white--text button_volver body-1" elevation="4" rounded  @click="backToVote()">
          Volver
        </v-btn>
      </div>
    </v-card>
  </div>
</template>

<script>
import NavBar from "../../components/NavBar";
import * as fb_functions from "../../API/firebase";

export default {
  components:{
    NavBar,
  },
  name: "AllVotes",
  data(){
    return {
      all_votes: [],
      snackbar_err: false,
    }
  },
  created() {
    window.scrollTo(0,0)

    this.all_votes = fb_functions.getAllVotes()
  },
  methods:{
    /**********************************************
     *
     * Shows the results of a vote
     *
     **********************************************/
    // @vuese
    // Used to show the three most voted drivers
    // @arg The arguments are two strings value representing the identifier and the state of a vote
    showResults(id, estado) {
      if(estado == 'activa'){
        this.snackbar_err = !this.snackbar_err
      }else{
        let index = this.all_votes.findIndex(function(n) {
          if(n.id == id)
            return true;
        })

        this.$router.push({path: '/all-votes/vote-results/', query: {id : id, name : this.all_votes[index].nombre_gp
          , first_path: this.all_votes[index].primero[0].path
            , first_percentaje: this.all_votes[index].primero[1]
            , second_path: this.all_votes[index].segundo[0].path
            , second_percentaje: this.all_votes[index].segundo[1]
            , third_path: this.all_votes[index].tercero[0].path
            , third_percentaje: this.all_votes[index].tercero[1]}})
      }
    },

    /**********************************************
     *
     * Go back to vote
     *
     *********************************************/
    // @vuese
    // Used to go to the vote page
    backToVote() {
      this.$router.push("/vote")
    },
  }
}
</script>

<style scoped>
.allVotes{
  margin-top: 48px;
  padding-top: 5%;
  padding-bottom: 5%;
  background-color: white;
  text-align: center;
}

.header{
  margin-bottom: 2%;
  padding: 3% 3%;
  display: inline-block;
  width: 100%;
  background-color: #333333;
}

#allVotes_container{
  height: auto;
  margin: 0 5% 5% 5%;
  width: 90%;
}

.button:hover{
  opacity: 0.8;
  cursor: pointer;
}

.button_volver{
  background-color: #212121 !important;
  margin-top: 10%;
  margin-bottom: 3%;
  width: 45%;
}

.vote_container{
  display: inline-block;
  margin-top: 5%;
  border-left: 4px solid #2c3e50;
  text-align: left;
}

#activa{
  background-color: #1976d2;
  color: white !important;
  border-left: 4px solid #1976d2;
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