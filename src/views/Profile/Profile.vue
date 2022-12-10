<template>
  <div class="profile">
    <v-snackbar v-model="snackbar" top :multi-line=true color="primary"> {{ snackbar_text }}
      <template v-slot:action="{ attrs }">
        <v-btn color="white" text v-bind="attrs" @click="snackbar = false" style="text-decoration: underline">
          Aceptar
        </v-btn>
      </template>
    </v-snackbar>
    <v-snackbar v-model="snackbar_err" top :multi-line=true color="error"> {{ snackbar_err_text }}
      <template v-slot:action="{ attrs }">
        <v-btn color="white" text v-bind="attrs" @click="snackbar_err = false" style="text-decoration: underline">
          Aceptar
        </v-btn>
      </template>
    </v-snackbar>

    <NavBar></NavBar>

    <v-card id="main_container" elevation="5">
      <div id="title_container">
        <h1 id="title" class="text-uppercase font-italic font-weight-bold">Perfil</h1>
      </div>
      <div id="buttons_container">
        <v-btn class="ma-sm main_button subtitle-1" id="logout_button" elevation="4" @click="logout()" >
          <v-icon class="mr-2" color="white">mdi-logout</v-icon>
          Log Out
        </v-btn>
      </div>
    </v-card>
    <v-card class="profile_container" elevation="6">
      <h2 id="header_profile" class="text-h5 text-md-h4 text-lg-h4 text-xl-h4">Datos</h2>
      <div class="pa-5">
        <v-layout>
          <v-col> <h1 class="body-2 text-md-body-1 text-lg-body-1 text-xl-body-1 font-weight-bold">Nombre</h1> </v-col>
          <v-col> <h1 class="body-2 text-md-body-1 text-lg-body-1 text-xl-body-1">{{this.nombre}}</h1> </v-col>
        </v-layout>
        <hr>
        <v-layout>
          <v-col> <h3 class="body-2 text-md-body-1 text-lg-body-1 text-xl-body-1 font-weight-bold">Apellidos</h3> </v-col>
          <v-col> <h3 class="body-2 text-md-body-1 text-lg-body-1 text-xl-body-1">{{this.apellidos}}</h3> </v-col>
        </v-layout>
        <hr>
        <v-layout >
          <v-col> <h3 class="body-2 text-md-body-1 text-lg-body-1 text-xl-body-1 font-weight-bold">Email</h3> </v-col>
          <v-col> <h3 class="body-2 text-md-body-1 text-lg-body-1 text-xl-body-1">{{this.email}}</h3> </v-col>
        </v-layout>
        <hr>
        <v-layout>
          <v-col> <h3 class="body-2 text-md-body-1 text-lg-body-1 text-xl-body-1 font-weight-bold">Usuario</h3> </v-col>
          <v-col> <h3 class="body-2 text-md-body-1 text-lg-body-1 text-xl-body-1 text-left">{{this.usuario}}</h3> </v-col>
        </v-layout>
        <hr>
        <v-layout>
          <v-col> <h3 class="body-2 text-md-body-1 text-lg-body-1 text-xl-body-1 font-weight-bold">Pais</h3> </v-col>
          <v-col> <h3 class="body-2 text-md-body-1 text-lg-body-1 text-xl-body-1">{{this.pais}}</h3> </v-col>
        </v-layout>
        <hr>
        <v-layout>
          <v-col> <h3 class="body-2 text-md-body-1 text-lg-body-1 text-xl-body-1 font-weight-bold">Fecha nacimiento</h3> </v-col>
          <v-col> <h3 class="body-2 text-md-body-1 text-lg-body-1 text-xl-body-1">{{this.fecha_nac}}</h3> </v-col>
        </v-layout>
      </div>
    </v-card>

    <div id="profile_settings">
      <h1 class="text-h4 ">Configuración</h1><br>
      <div class="user_config">
        <v-btn class="ma-sm body-1 ocp_button" depressed @click="expand=!expand,expand_2=false,expand_3=false,expand_4=false">perfil</v-btn>
        <v-expand-transition>
          <v-form v-show="expand" v-model="valid" class="mx-auto">
            <v-card class="container" elevation="10">
              <v-toolbar flat color="#2c3e50" dark>
                <v-toolbar-title>Actualizar perfil</v-toolbar-title>
              </v-toolbar>
              <div class="ma-8">
                <v-text-field v-model="nombre" :rules="nombreRules" label="Nombre" required></v-text-field>
                <v-text-field v-model="apellidos" :rules="apellidosRules" label="Apellidos" required></v-text-field>
                <v-autocomplete v-model="pais" :rules="[() => !!pais || 'Introduzca su país']" :items="countries" label="País" placeholder="Select..." required></v-autocomplete>
                <v-dialog ref="dialog" v-model="modal" :return-value.sync="fecha_nac" persistent width="290px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field v-model="fecha_nac" label="Fecha de nacimiento" readonly v-bind="attrs" v-on="on"></v-text-field>
                  </template>
                  <v-date-picker v-model="fecha_nac" scrollable>
                    <v-spacer></v-spacer>
                    <v-btn text color="second" @click="modal = false">Cancelar</v-btn>
                    <v-btn text color="primary" @click="$refs.dialog.save(fecha_nac)">OK</v-btn>
                  </v-date-picker>
                </v-dialog>
              </div>
              <div class="buttons_cfg_container">
                <v-btn class="button body-1 button_cancel" elevation="4" rounded @click="expand = !expand">Cancelar</v-btn>
                <v-btn class="button body-1 button_public" elevation="4" rounded :disabled="!valid" @click="updateProfile()">Actualizar</v-btn>
              </div>
            </v-card>
          </v-form>
        </v-expand-transition>
      </div>

      <div class="user_config">
        <v-btn class="ma-sm body-1 ocp_button" depressed @click="expand_2=!expand_2,expand=false,expand_3=false,expand_4=false">Contraseña</v-btn>
        <v-expand-transition>
          <v-form v-show="expand_2" v-model="valid_2" class="mx-auto">
            <v-card class="container" elevation="10">
              <v-toolbar flat color="#2c3e50" dark>
                <v-toolbar-title>Actualizar contraseña</v-toolbar-title>
              </v-toolbar>
              <div class="ma-8">
                <v-text-field v-model="psw_vieja" :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'" :rules="[rules.required, rules.min]"
                              :type="show1 ? 'text' : 'password'" name="input-10-1" label="Contraseña actual" @click:append="show1 = !show1" autocomplete
                ></v-text-field>
                <v-text-field v-model="psw_nueva" :append-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'" :rules="[rules_nueva.required, rules_nueva.min]"
                              :type="show2 ? 'text' : 'password'" name="input-10-1" label="Contraseña nueva" @click:append="show2 = !show2" autocomplete
                ></v-text-field>
                <v-text-field v-model="psw_nueva_2" :append-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'" :rules="[rules_nueva.required, rules_nueva.min]"
                              :type="show2 ? 'text' : 'password'" name="input-10-1" label="Repita la contraseña nueva" @click:append="show2 = !show2" autocomplete
                ></v-text-field>
              </div>
              <div class="buttons_cfg_container">
                <v-btn class="button body-1 button_cancel" elevation="4" rounded @click="expand_2 = !expand_2">Cancelar</v-btn>
                <v-btn class="button body-1 button_public" elevation="4" rounded :disabled="!valid_2" @click="updatePwd(psw_vieja, psw_nueva, psw_nueva_2)">Actualizar</v-btn>
              </div>
            </v-card>
          </v-form>
        </v-expand-transition>
      </div>

      <div class="user_config">
        <v-btn class="ma-sm body-1 ocp_button" depressed @click="expand_3=!expand_3,expand=false,expand_2=false,expand_4=false">Email</v-btn>
        <v-expand-transition>
          <v-form v-show="expand_3" v-model="valid_3" class="mx-auto">
            <v-card class="container" elevation="10">
              <v-toolbar flat color="#2c3e50" dark>
                <v-toolbar-title>Actualizar email</v-toolbar-title>
              </v-toolbar>
              <div class="ma-8">
                <v-text-field v-model="psw" :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'" :rules="[rules.required, rules.min]"
                              :type="show1 ? 'text' : 'password'" name="input-10-1" label="Contraseña actual" @click:append="show1 = !show1" autocomplete
                ></v-text-field>
                <v-text-field v-model="email_nuevo" :rules="emailRules" label="E-mail" required></v-text-field>
              </div>
              <div class="buttons_cfg_container">
                <v-btn class="button body-1 button_cancel" elevation="4" rounded @click="expand_3 = !expand_3">Cancelar</v-btn>
                <v-btn class="button body-1 button_public" elevation="4" rounded :disabled="!valid_3" @click="updateEmail(psw, email_nuevo, psw_nueva_2)">Actualizar</v-btn>
              </div>
            </v-card>
          </v-form>
        </v-expand-transition>
      </div>

      <div class="user_config" v-if="this.permission==true">
        <v-btn class="ma-sm body-1 ocp_button" depressed @click="retrieveUsers()">permisos</v-btn>
        <v-expand-transition>
          <v-form v-show="expand_4" v-model="valid_4" class="mx-auto">
            <v-card class="container" elevation="10">
              <v-toolbar flat color="#2c3e50" dark>
                <v-toolbar-title>Actualizar permisos</v-toolbar-title>
              </v-toolbar>
              <div class="ma-8">
                <v-autocomplete v-model="user_selected" :loading="loading" :items="items" :search-input.sync="search"
                    cache-items flat hide-no-data hide-details label="Nombre de usuario" solo-inverted :rules="user_nameRules"
                ></v-autocomplete><br>
                <v-text-field v-model="psw" :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'" :rules="[rules.required, rules.min]"
                              :type="show1 ? 'text' : 'password'" name="input-10-1" label="Contraseña actual" @click:append="show1 = !show1" autocomplete
                ></v-text-field>
                <v-radio-group v-model="radioGroup">
                  <v-radio label="Activar permisos" id="radio_button_activate"></v-radio>
                  <v-radio label="Desactivar permisos" id="radio_button_desactivate"></v-radio>
                </v-radio-group>
              </div>
              <div class="buttons_cfg_container">
                <v-btn class="button body-1 button_cancel" elevation="4" rounded @click="expand_4 = !expand_4">Cancelar</v-btn>
                <v-btn class="button body-1 button_public" elevation="4" rounded :disabled="!valid_4" @click="updateUserPermission(psw, user_selected, radioGroup)">Actualizar</v-btn>
              </div>
            </v-card>
          </v-form>
        </v-expand-transition>
      </div>

    </div>
  </div>
</template>

<script>
import NavBar from "../../components/NavBar";
import firebase from "firebase/app";
import {countries} from "../../store/constants";
import * as fb_functions from "../../API/firebase";

export default {
  mounted: function () {
    this.showMyAccount();
  },
  data(){
    return {
      snackbar: false,
      snackbar_text: '',
      snackbar_err: false,
      snackbar_err_text: '',
      loading: false,
      items: [],
      search: null,
      user_selected: null,
      user_nameRules: [
        v => !!v || 'Seleccione un usuario',
      ],
      user_names: [],
      radioGroup: 0,
      modal: false,
      expand: false,
      expand_2: false,
      expand_3: false,
      expand_4: false,
      valid: false,
      valid_2: false,
      valid_3: false,
      valid_4: false,
      show1: false,
      show2: false,
      usuario:'',
      permission:'',
      pais:'',
      countries: countries,
      fecha_nac:'',
      email:'',
      email_nuevo:'',
      emailRules: [
        v => !!v || 'Introduzca su nuevo E-mail',
        v => /.+@.+/.test(v) || 'E-mail no valido',
      ],
      nombre: '',
      nombreRules: [
        v => !!v || 'Introduzca su nombre',
      ],
      apellidos: '',
      apellidosRules: [
        v => !!v || 'Introduzca su apellidos',
      ],
      psw_vieja: '',
      psw_nueva: '',
      psw_nueva_2: '',
      psw:'',
      rules: {
        required: value => !!value || 'Introduzca su contraseña actual.',
        min: v => v.length >= 6 || 'Mínimo 6 caracteres',
        emailMatch: () => ('El E-mail y la contraseña no coinciden '),
      },
      rules_nueva: {
        required: value => !!value || 'Introduzca una contraseña nueva.',
        min: v => v.length >= 6 || 'Mínimo 6 caracteres',
        emailMatch: () => ('El E-mail y la contraseña no coinciden '),
      },
    }
  },
  watch: {
    search (val) {
      val && val !== this.select && this.querySelections(val)
    },
  },
  name: "Profile-view-view",
  components: {
    NavBar
  },
  methods: {
    /**********************************************
     *
     * Get all usersnames from database
     *
     **********************************************/
    // @vuese
    // Used get all username from database
    retrieveUsers(){
      const db = firebase.firestore();
      this.expand_4=!this.expand_4
      this.expand=false
      this.expand_2=false
      this.expand_3=false
      db.collection("usuarios").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          this.user_names.push(doc.data().usuario)
        })
      });
    },

    /**********************************************
     *
     * Search user name
     *
     **********************************************/
    // @vuese
    // Used to search for a user
    // @arg The argument is a string value representing the searched name
    querySelections (v) {
      this.loading = true

      setTimeout(() => {
        this.items = this.user_names.filter(e => {
          return (e || '').toLowerCase().indexOf((v || '').toLowerCase()) > -1
        })
        this.loading = false
      }, 500)
    },

    /**********************************************
     *
     * Get user account information
     *
     **********************************************/
    // @vuese
    // Used to show user's profile
    showMyAccount() {
      window.scrollTo(0,0);
      const db = firebase.firestore();
      this.autor = localStorage.getItem('USER_NAME')
      if(fb_functions.user_permission == ''){
        fb_functions.getAuthentication()
      }
      this.permission = fb_functions.user_permission

      db.collection("usuarios").doc(this.autor).get().then((doc2) => {
        this.nombre = doc2.data().nombre;
        this.apellidos = doc2.data().apellidos;
        this.pais = doc2.data().pais;
        this.fecha_nac = doc2.data().fecha_nac;
        this.email = doc2.data().email;
        this.usuario = doc2.data().usuario;
      });
    },

    /**********************************************
     *
     * Save the profile changes to the database
     *
     **********************************************/
    // @vuese
    // Used to update a user's profile
    updateProfile(){
      const db = firebase.firestore();
      db.collection("usuarios").doc(this.usuario).update({
        nombre : this.nombre,
        apellidos: this.apellidos,
        fecha_nac: this.fecha_nac,
        pais: this.pais,
      }).then(() =>{
        this.showSnackbar("Datos actualizados")
        this.expand = !this.expand;
      }).catch((error) => {
        console.error("Error updating user information: ", error);
      });
    },

    /**********************************************
     *
     * Change the password
     *
     **********************************************/
    // @vuese
    // Used to update a user's password
    // @arg The arguments are three strings value representing the old password and the new password twice
    updatePwd(psw_old, psw_new, psw_new_2) {
      let user = firebase.auth().currentUser;

      if(user !== null){
        if (psw_old == psw_new) {
          this.showSnackbar_err("La contraseña nueva no puede ser igual que la actual")
        } else if (psw_new != psw_new_2) {
          this.showSnackbar_err("Las contraseñas nuevas no coinciden")
        } else {

          const credential = firebase.auth.EmailAuthProvider.credential(
              user.email,
              this.psw_vieja
          );

          user.reauthenticateWithCredential(credential).then(() => {           // User re-authenticated.
            user.updatePassword(psw_new).then(() => {
              // Update successful.
              this.showSnackbar("Contraseña modificada correctamente")
              this.expand_2 = !this.expand_2;
              this.psw_vieja = this.psw_nueva = this.psw_nueva_2 = '';
            }).catch((error) => {
              // An error ocurred
              console.error(error)
            });
          }).catch((error) => {
            // An error ocurred
            this.showSnackbar_err("La contraseña actual no es correcta")
            console.error(error)
          });
        }
      }
    },

    /**********************************************
     *
     * Change the email
     *
     **********************************************/
    // @vuese
    // Used to update a user's email
    // @arg The arguments are two strings value representing the password and the new email account
    updateEmail(psw, email_new){
      let user = firebase.auth().currentUser;

      if(user !== null){
        if(this.email == email_new){
          this.showSnackbar_err("El email nuevo es igual que el actual")
        }else{
          const credential = firebase.auth.EmailAuthProvider.credential(
              user.email,
              this.psw
          );
          user.reauthenticateWithCredential(credential).then(() => {           // User re-authenticated.
            user.updateEmail(email_new).then(() => {
              // Update successful.
              const db = firebase.firestore()

              db.collection("usuarios").doc(this.usuario).update({
                email : email_new,
              }).then(() =>{
                this.showSnackbar("E-mail modificado correctamente")
                this.expand_3 = ! this.expand_3;
                this.email = email_new
              }).catch((error) => {
                console.error("Error updating user information: ", error);
              });

            }).catch((error) => {
              // An error ocurred
              console.error(error)
            });
          }).catch((error) => {
            // An error ocurred
            this.showSnackbar_err("La contraseña no es correcta")
            console.error(error)
          });
        }
      }
    },

    /**********************************************
     *
     * Change permission of the user
     *
     **********************************************/
    // @vuese
    // Used to update a user's permissions
    // @arg The arguments are three strings value representing the admin password, selected user and permissions
    updateUserPermission(psw, user_selected, radioGroup){
      let user = firebase.auth().currentUser;

      if(user !== null){
        const db = firebase.firestore();
        let permission

        if(radioGroup == 0)
          permission = true
        else if (radioGroup == 1)
          permission = false

        const credential = firebase.auth.EmailAuthProvider.credential(
            user.email,
            psw
        );

        user.reauthenticateWithCredential(credential).then(() => {           // User re-authenticated.
          db.collection("usuarios").doc(user_selected).update({
            admin : permission,
          }).then(() =>{
            this.showSnackbar("Permisos actualizados")
            this.expand_4 = ! this.expand_4;
          }).catch((error) => {
            console.error("Error updating user information: ", error);
          });
        }).catch((error) => {
          // An error ocurred
          this.showSnackbar_err("La contraseña no es correcta")
          console.error(error)
        });
      }
    },

    /**********************************************
     *
     * Log out of the system
     *
     **********************************************/
    // @vuese
    // Used to log from the system
    logout(){
      firebase.auth().signOut().then(() => {
        // Sign-out successful.
        this.$router.push('/login')
        localStorage.removeItem('USER_NAME');

      }).catch((error) => {
        // An error happened.
        console.log(error)
      });
    },

    // @vuese
    // Used to show snackbar error alert
    // @arg The argument is a string value representing the displayed text
    showSnackbar_err(cad){
      this.snackbar_err_text = cad
      this.snackbar_err = !this.snackbar_err
    },

    // @vuese
    // Used to show snackbar alert
    // @arg The argument is a string value representing the displayed text
    showSnackbar(cad){
      this.snackbar_text = cad
      this.snackbar = !this.snackbar
    }
  }
}
</script>

<style scoped>
.profile{
  margin-top: 48px;
  background-color: white;
  text-align: center;
}

#main_container{
  width: 100%;
  background-color: #D50000;
  display: inline-block;
}

#title_container{
  width: 50%;
  float: left;
  display: inline-block;
}

#title{
  margin-top: 0;
  padding-top: 20px;
  padding-left: 10%;
  padding-bottom: 20px;
  color: white;
  font-size: 8vw;
  text-align: left;
}

#buttons_container{
  width: 40%;
  padding: 5% 0;
  float: left;
  display: inline-block;
  align-content: center;
}

.main_button{
  background-color: #D50000 !important;
  color: white;
  margin: 5px;
}
#logout_button{
  background-color: #263238 !important;
}
#logout_button:hover{
  background-color: #6A767C !important;
  opacity: 1 !important;
}

#header_profile{
  text-align: center;
  background-color: #2c3e50;
  color: white;
  padding: 1%;
}

.profile_container{
  text-align: left;
  margin: 5%;
  width: 90%;
  display: inline-block;
}

.container{
  width: 90%;
  margin: 5%;
  border-radius: 12px;
  padding: 0;
}

.main_button{
  background-color: #D50000 !important;
  color: white;
  margin: 5px;
}

#profile_settings{
  margin-top: 10%;
  margin-bottom: 10%;
}

.buttons_cfg_container{
  margin-top: 5%;
  margin-bottom: 5%;
  display: inline-block;
  width: 100%;
}
.ocp_button{
  width: 80%;
  text-align: left !important;
  background-color: #D50000 !important;
  color: white;
}
.button_public{
  background-color: #D50000 !important;
  margin-right: 0%;
  margin-left: 5%;
  color: white;
  width: 45%;
}
.button_cancel{
  background-color: #212121 !important;
  margin-right: 0%;
  color: white;
  width: 45%;
}
button:hover{
  opacity: 0.8 !important;
}

.user_config{
  width: 90%;
  margin-left: 5%;
  margin-bottom: 2%;
}

h1, h2, h3, h4, h5, h6, p,
.text-h1, .text-h2, .text-h3, .text-h4, .text-h5, .text-h6,
.text-md-h1, .text-md-h2, .text-md-h3, .text-md-h4, .text-md-h5, .text-md-h6,
.text-lg-h1, .text-lg-h2, .text-lg-h3, .text-lg-h4, .text-lg-h5, .text-lg-h6,
.text-xl-h1, .text-xl-h2, .text-xl-h3, .text-xl-h4, .text-xl-h5, .text-xl-h6,
.body-1, .body-2, .subtitle-1{
  font-family: "F1 Regular" !important;
}
</style>