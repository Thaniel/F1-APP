<template>
  <div class="comments">

    <v-snackbar v-model="snackbar" top :multi-line=true color="primary"> {{ snackbar_text }}
      <template v-slot:action="{ attrs }">
        <v-btn color="white" text v-bind="attrs" @click="snackbar = false" style="text-decoration: underline">
          Aceptar
        </v-btn>
      </template>
    </v-snackbar>

    <NavBar></NavBar>
    <Dialog :visible="showDialog_2" @close="showDialog_2=false" @clicked="onClickChild_2" ref="myDialog_2"></Dialog>

    <v-card id="main_container" elevation="5">
      <h1 id="title_theme" class="text-uppercase font-italic font-weight-bold text-h4 text-md-h3 text-lg-h3 text-xl-h3 pa-8"> {{ title_theme }} </h1>
    </v-card>

    <v-card class="comments_container" elevation="8">
      <template v-for="c in comments">
        <div class="comment pa-2 rounded" :key="c.id">
          <v-layout class="ml-2">
            <v-col class="pa-0 ma-0">
              <h1 class="text-body-2 font-weight-bold text-md-h6 text-lg-h6 text-xl-h6 text-left">{{c.autor}}</h1>
            </v-col>
            <v-col class="pa-0 ma-0">
              <h1 class="text-caption text-md-body-2 text-lg-body-2 text-xl-body-2 text-right">{{c.fecha}}</h1>
            </v-col>
          </v-layout>
          <v-layout>
            <v-col class="pa-2 rounded" cols="10" sm="10" md="10" style="background-color: #ffffff">
              <h1 v-show="c.flag_edit==false" class="text-body-2 text-md-body-1 text-lg-body-1 text-xl-body-1 text-left">{{c.texto}}</h1>
              <div v-show="c.flag_edit==true">
                <v-form class="input_text" v-model="valid_2">
                  <v-textarea clearable clear-icon="mdi-close-circle" :id="c.id" v-model="update_comment" :rules="new_commentRules"></v-textarea>
                  <v-btn small class="ma-2 white--text float-right button_public" elevation="4" rounded @click="editComment(c, c.id, update_comment)" :disabled="!valid_2" >Guardar</v-btn>
                  <v-btn small class="ma-2 white--text float-right button_cancel" elevation="4" rounded @click="c.flag_edit =! c.flag_edit">Cancelar</v-btn>
                </v-form>
              </div>
            </v-col>
            <v-col class="pa-2" cols="2" sm="2" md="2">
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
    </v-card>

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
            <v-btn class="button body-1" id="button_cancel" elevation="4" rounded @click="expand = !expand">Cancelar</v-btn>
            <v-btn class="button body-1" id="button_public" elevation="4" rounded :disabled="!valid" @click="createComment()">Publicar</v-btn>
          </div>
        </v-card>
      </v-form>
    </v-expand-transition>

    <div class="mb-16">
      <v-btn class="body-1 mb-16" elevation="4" @click="expand = !expand" color="primary">Comentar</v-btn>
    </div>

    <v-footer class="mt-16" dark absolute padless>
      <v-col class="text-right" cols="6">
        Autor:
      </v-col>
      <v-col class="text-left" cols="6">
        <h1 class="text-subtitle-1 text-md-h6 text-lg-h6 text-xl-h6">{{ author_theme }}</h1>
      </v-col>
    </v-footer>

  </div>
</template>

<script>
import NavBar from "../../components/NavBar";
import * as fb_functions from "../../API/firebase";
import {getDate} from "../../store/common";
import Dialog from "../../components/Dialog";

export default {
  data(){
    return {
      showDialog_2: false,
      snackbar: false,
      snackbar_text: '',
      valid: false,
      valid_2: false,
      comments: [],
      comment_selected:'',
      expand: false,
      title_theme: '',
      author_theme: '',
      new_comment: '',
      new_commentRules: [
      v => !!v ||  'Introduzca un comentario',
      ],
      current_user: '',
      update_comment: '',
    }
  },
  name: "Comments-view",
  components: {
    NavBar,
    Dialog
  },
  /**********************************************
   *
   * Firestore Real-Time
   *
   *********************************************/
  created() {
    window.scrollTo(0, 0)
    if(this.comments.length <= 0) {
      this.comments = fb_functions.getComments(this.$route.query.id)
    }

    this.current_user = localStorage.getItem('USER_NAME')
    if(fb_functions.user_permission == ''){
      fb_functions.getAuthentication()
    }
    this.permission = fb_functions.user_permission

    this.title_theme = this.$route.query.title
    this.author_theme = this.$route.query.author
  },
  methods:{

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

        let theme_id = this.$route.query.id
        let date = getDate('/')
        this.current_user = localStorage.getItem('USER_NAME')

        fb_functions.addCommentToTheme(theme_id, this.current_user, this.new_comment, date)

        this.showSnackbar("Comentario creado")
        this.expand = !this.expand
        this.new_comment = ''
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
      let theme_id = this.$route.query.id

      fb_functions.editCommentToTheme(theme_id, comment_id, text)
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
      let theme_id = this.$route.query.id

      fb_functions.deleteCommentToTheme(theme_id, comment_id)
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
      if(value == 'accept')
        this.deleteComment(this.comment_selected)
    }
  }
}
</script>

<style scoped>
.comments{
  margin-top: 48px;
  background-color: white;
  text-align: center;
}

#title_theme{
  color: #D50000;
}

#container_create{
  width: 90%;
  margin: 5%;
  border-radius: 12px;
}

#main_container{
  padding: 5% 10%;
}

.comments_container{
  margin: 5% 3%;
  padding: 1%;
}

.comment{
  margin-top: 5%;
  border-left: 5px solid #2c3e50;
  background-color: #ddddff;
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
.body-1, .body-2, .text-body-2, .text-md-body-1, .text-lg-body-1, text-xl-body-1{
  font-family: "F1 Regular" !important;
}
</style>