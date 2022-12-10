<template>
  <div class="new-details">
    <v-snackbar v-model="snackbar" top :multi-line=true color="primary"> {{ snackbar_text }}
      <template v-slot:action="{ attrs }">
        <v-btn color="white" text v-bind="attrs" @click="snackbar = false" style="text-decoration: underline">
          Aceptar
        </v-btn>
      </template>
    </v-snackbar>

    <NavBar></NavBar>
    <Dialog :visible="showDialog" @close="showDialog=false" @clicked="onClickChild_2" ref="myDialog_2"></Dialog>

    <div id="new_container">
      <v-card class="rounded-lg body_card" elevation="10">
        <h1 id="new_title" class="text-h5 text-md-h3 text-lg-h3 text-xl-h2">{{ new_object.titulo }}</h1>
        <img :src="new_object.url_foto" id="image" alt="New image"/>

        <hr>
        <div class="container">
          <h2 id="new_author" class="subtitle-2 text-md-h6 text-lg-h6 text-xl-h6">{{ new_object.autor }}</h2>
          <h3 id="new_date" class="subtitle-2 text-md-h6 text-lg-h6 text-xl-h6">{{ new_object.fecha }}</h3>
        </div>
        <v-card-text id="new_text">{{ new_object.texto }}</v-card-text>

      </v-card>

      <v-card class="mt-10 pb-2" elevation="8">
        <v-toolbar flat color="#2c3e50" dark>
          <v-toolbar-title>Comentarios</v-toolbar-title>
        </v-toolbar>
        <template v-for="c in comments">
          <div class="comment pa-2 ma-2 rounded" :key="c.id">
            <v-layout class="ml-2">
              <v-col class="pa-0 ma-0">
                <h1 class="text-body-2 font-weight-bold text-md-h6 text-lg-h6 text-xl-h6 text-left">{{c.autor}}</h1>
              </v-col>
              <v-col class="pa-0 ma-0">
                <h1 class="text-caption text-md-body-2 text-lg-body-2 text-xl-body-2 text-right">{{c.fecha}}</h1>
              </v-col>
            </v-layout>
            <v-layout>
              <v-col class="pa-2 rounded" cols="9" sm="10" md="10" style="background-color: #ffffff">
                <h1 v-show="c.flag_edit==false" class="text-body-2 text-md-body-1 text-lg-body-1 text-xl-body-1 text-left">{{c.texto}}</h1>
                <div v-show="c.flag_edit==true">
                  <v-form class="input_text" v-model="valid_2">
                    <v-textarea clearable clear-icon="mdi-close-circle" :id="c.id" v-model="update_comment" :rules="new_commentRules"></v-textarea>
                    <v-btn small class="ma-2 white--text float-right button_public" elevation="4" rounded @click="editComment(c, c.id, update_comment)" :disabled="!valid_2" >Guardar</v-btn>
                    <v-btn small class="ma-2 white--text float-right button_cancel" elevation="4" rounded @click="c.flag_edit =! c.flag_edit">Cancelar</v-btn>
                  </v-form>
                </div>
              </v-col>
              <v-col class="pa-2" cols="3" sm="2" md="2">
                <v-layout>
                  <div v-show="c.autor===current_user">
                    <v-btn v-show="c.flag_edit==false" x-small class="blue ma-2" elevation="4" rounded @click="c.flag_edit =! c.flag_edit, update_comment=c.texto" >
                      <v-icon small color="white">mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn v-show="c.flag_edit==false" x-small class="red accent-4" elevation="4" rounded @click="$refs.myDialog_2.active('Eliminar comentario', '¿Esta seguro de eliminar el comentario?'), comment_selected = c.id" >
                      <v-icon small color="white">mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </v-layout>
              </v-col>
            </v-layout>
          </div>
        </template>

        <v-expand-transition>
          <v-form v-show="expand" class="input_text" v-model="valid">
            <v-card id="container_create" elevation="10">
              <v-toolbar flat color="#2c3e50" dark>
                <v-toolbar-title>Publicar un comentario</v-toolbar-title>
              </v-toolbar>
              <div class="ma-8">
                <v-textarea v-model="new_comment" clearable clear-icon="mdi-close-circle" :rules="new_commentRules" label="Escriba un comentario" value="..."></v-textarea>
              </div>
              <div id="buttonsCreate_container">
                <v-btn class="button body-2" id="button_cancel" elevation="4" rounded @click="expand = !expand">Cancelar</v-btn>
                <v-btn class="button body-2" id="button_public" elevation="4" rounded :disabled="!valid" @click="createComment()">Publicar</v-btn>
              </div>
            </v-card>
          </v-form>
        </v-expand-transition>

        <v-btn class="body-2 ma-10" elevation="4" @click="expand = !expand" color="primary">Comentar</v-btn>
      </v-card>

      <v-btn class="button white--text button_volver body-1" elevation="4" rounded @click="backToNews()">Volver</v-btn>

    </div>

  </div>
</template>

<script>
import NavBar from "../../components/NavBar";
import Dialog from "../../components/Dialog";
import * as fb_fucntions from "../../API/firebase";
import {getDate} from "../../store/common";

export default {
  name: "NewDetails",
  data(){
    return {
      valid: false,
      valid_2: false,
      snackbar: false,
      snackbar_text: '',
      expand: false,

      new_object: {},
      comments: [],
      showDialog: false,
      current_user: '',
      comment_selected:'',
      new_comment: '',
      new_commentRules: [
        v => !!v ||  'Introduzca un comentario',
      ],
      update_comment: '',
    }
  },
  components: {
    NavBar,
    Dialog
  },
  created() {
    window.scrollTo(0,0)
    this.current_user = localStorage.getItem('USER_NAME')

    this.new_object = fb_fucntions.getNew(this.$route.params.id)

    // Retrieve comments sub-collection
    if(this.comments.length <= 0) {
      this.comments = fb_fucntions.getCommentsOfANew(this.$route.params.id)
    }
  },
  methods: {
    // @vuese
    // Used to go to the news page
    backToNews(){
      this.$router.push("/news");
    },
    /**********************************************
     *
     * Create new comment
     *
     *********************************************/
    // @vuese
    // Used to create a comment
    createComment() {
      if (this.new_comment.length <= 0) {
        alert("Por favor, el comentario no puede estar vacio")
      } else {
        let date = getDate('/')
        fb_fucntions.addCommentToNew(this.$route.params.id, this.current_user, this.new_comment, date)
        this.showSnackbar("Comentario creado")
        this.expand = !this.expand
      }
    },

    /**********************************************
     *
     * Edit comment selected
     *
     *********************************************/
    // @vuese
    // Used to edit a comment
    // @arg The arguments are three string value representing the comment, the identifier and the text
    editComment(comment, comment_id, text){
      fb_fucntions.editCommentToNew(this.$route.params.id, comment_id, text)
      this.showSnackbar("Comentario actualizado")
      comment.flag_edit = false
    },

    /**********************************************
     *
     * Delete comment selected
     *
     *********************************************/
    // @vuese
    // Used to delete a comment
    // @arg The argument is a string value representing the comment identifier
    deleteComment(comment_id){
      fb_fucntions.deleteCommentToNew(this.$route.params.id, comment_id)
      this.showSnackbar("Comentario eliminado")
    },

    // @vuese
    // Used to show snackbar alert
    // @arg The argument is a string value representing the displayed text
    showSnackbar(cad){
      this.snackbar_text = cad
      this.snackbar =! this.snackbar
    },

    // @vuese
    // Used to obtain the confirmation or cancellation response of the operation
    // @arg The argument is a string value representing the response the user's response
    onClickChild_2 (value) {
      console.log(value)
      if(value == 'accept')
        this.deleteComment(this.comment_selected)
    }
  }
}
</script>

<style scoped>
.new-details{
  background-color: white;
  text-align: center;
  margin-top: 48px;
}
#new_container{
  margin: 10%;
  width: 80%;
  background-color: #fff;
  display: inline-block;
  text-align: center;
}

.body_card{
  padding: 3% 10% 5% 10%;
}

#new_title{
  padding: 5% 0;
  color: #D50000;
  text-align: left;
}
.container{
  width: 100%;
  display: inline-block;
  padding: 2% 0 2% 0;
  text-align: left;
}
#new_author{
  width: 45%;
  color: #2c3e50;
  float: left;
}
#new_date{
  width: 55%;
  float: left;
  text-align: right;
}

#new_text{
  margin: 0;
  width: auto;
  padding: 5%;
  color: black;
  text-align: left;
}
hr{
  border-top: 2px solid #2c3e50;
}

button:hover {
  opacity: 0.8;
  cursor: pointer;
}

.button_volver {
  color: white;
  margin-top: 5%;
  width: 45%;
  background-color: #212121 !important;
}

img{
  width: 100%;
}

.comment{
  margin-top: 2% !important;
  border-left: 5px solid #2c3e50;
  background-color: #ddddff;
}

#container_create{
  width: 90%;
  margin: 5%;
  border-radius: 12px;
}

#buttonsCreate_container{
  margin-top: 5%;
  margin-bottom: 5%;
  display: inline-block;
  width: 100%;
}

#button_public{
  background-color: #D50000;
  margin-right: 0%;
  margin-left: 5%;
  color: white;
  width: 40%;
}

.button_public{
  background-color: #D50000 !important;
}

#button_cancel{
  background-color: #212121;
  margin-right: 5%;
  color: white;
  width: 40%;
}

.button_cancel{
  background-color: #212121 !important;
}

h1, h2, h3, h4, h5, h6, p,
.text-h1, .text-h2, .text-h3, .text-h4, .text-h5, .text-h6,
.text-md-h1, .text-md-h2, .text-md-h3, .text-md-h4, .text-md-h5, .text-md-h6,
.text-lg-h1, .text-lg-h2, .text-lg-h3, .text-lg-h4, .text-lg-h5, .text-lg-h6,
.text-xl-h1, .text-xl-h2, .text-xl-h3, .text-xl-h4, .text-xl-h5, .text-xl-h6,
.body-1, .body-2 {
  font-family: "F1 Regular" !important;
}
</style>