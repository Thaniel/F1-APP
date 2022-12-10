<template>
  <div>
    <div class="sign-up">
      <v-snackbar v-model="snackbar" top :multi-line=true color="error"> {{ snackbar_text }}
        <template v-slot:action="{ attrs }">
          <v-btn color="white" text v-bind="attrs" @click="snackbar = false" style="text-decoration: underline">
            Aceptar
          </v-btn>
        </template>
      </v-snackbar>
      <v-container class="img_container">
        <img src="../../assets/f1_red.png" alt="F1 logo" class="avatar">
      </v-container>
      <h1 class="h1 text-uppercase font-weight-bold">REGISTRARSE</h1>
      <p>Por favor, rellene todos los campos para crear una cuenta.</p>
      <hr>
      <v-form v-model="valid" id="form_signup">
        <v-text-field v-model="new_firstname" :rules="firstnameRules" label="Nombre" required></v-text-field>
        <v-text-field v-model="new_lastname" :rules="lastnameRules" label="Apellidos" required></v-text-field>
        <v-autocomplete v-model="new_country" :rules="[() => !!new_country || 'Introduzca su país']" :items="countries" label="País" placeholder="Select..." required></v-autocomplete>

        <v-dialog ref="dialog" v-model="modal" :return-value.sync="new_birth" persistent width="290px">
          <template v-slot:activator="{ on, attrs }">
            <v-text-field v-model="new_birth" label="Fecha de nacimiento" readonly v-bind="attrs" v-on="on"></v-text-field>
          </template>
          <v-date-picker v-model="new_birth" scrollable>
            <v-spacer></v-spacer>
            <v-btn text color="second" @click="modal = false">Cancelar</v-btn>
            <v-btn text color="primary" @click="$refs.dialog.save(new_birth)">OK</v-btn>
          </v-date-picker>
        </v-dialog>

        <v-text-field v-model="new_username" :rules="usernameRules" label="Nombre de usuario" required></v-text-field>
        <v-text-field v-model="new_email" :rules="emailRules" label="E-mail" required></v-text-field>
        <v-text-field v-model="new_password" :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'" :rules="[rules.required, rules.min]"
            :type="show1 ? 'text' : 'password'" name="input-10-1" label="Contraseña" @click:append="show1 = !show1" autocomplete
        ></v-text-field>
        <v-text-field v-model="new_repeat_psw" :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'" :rules="[rules.required, rules.min]"
            :type="show1 ? 'text' : 'password'" name="input-10-1" label="Repita la contraseña" @click:append="show1 = !show1" autocomplete
        ></v-text-field>
      </v-form>
    </div>
    <div id="buttons_container">
      <v-btn class="button body-2" id="button_accept" elevation="4" rounded :disabled="!valid" @click="signUp">Aceptar</v-btn>
      <v-btn class="button body-2" id="button_cancel" elevation="4" rounded @click="back">Cancelar</v-btn>
    </div>
  </div>
</template>

<script>
import firebase from "firebase/app";
import {countries} from "../../store/constants";

export default {
  name: "SignUp",
  data(){
    return {
      snackbar: false,
      snackbar_text: '',
      modal: false,
      valid: false,
      countries: countries,
      new_birth: '',
      new_country: '',
      new_firstname: '',
      firstnameRules: [
        v => !!v || 'Introduzca su nombre',
      ],
      new_lastname: '',
      lastnameRules: [
        v => !!v || 'Introduzca su apellidos',
      ],
      new_username: '',
      usernameRules: [
        v => !!v || 'Introduzca un nombre de usuario',
      ],
      new_email: '',
      emailRules: [
        v => !!v || 'Introduzca su E-mail',
        v => /.+@.+/.test(v) || 'E-mail no valido',
      ],
      show1: false,
      new_password: '',
      new_repeat_psw: '',
      rules: {
        required: value => !!value || 'Introduzca su contraseña.',
        min: v => v.length >= 6 || 'Mínimo 6 caracteres',
        emailMatch: () => ('El E-mail y la contraseña no coinciden '),
      }
    }
  },
  created() {
    window.scrollTo(0,0)
  },
  methods:{
    /**********************************************
     *
     * Sign up into the system
     *
     *********************************************/
    // @vuese
    // Used to create a new user account
    signUp(){
      if(this.new_firstname.length<=0 || this.new_lastname.length<=0 || this.new_birth.length<=0 || this.new_country.length<=0
         || this.new_username.length<=0 || this.new_email.length<=0 || this.new_password.length<=0 || this.new_repeat_psw.length<=0) {
        //alert("Por favor, rellene todos los campos")
        this.showSnackbar("Por favor, rellene todos los campos")
      }
      else if(this.new_password != this.new_repeat_psw){
        //alert("Las contraseñas no coinciden")
        this.showSnackbar("Las contraseñas no coinciden")
        this.new_password = this.new_repeat_psw = ''
      }
      else {
        let db = firebase.firestore()

        db.collection("usuarios").doc(this.new_username).get().then((doc) => {
          if (doc.exists) {
            this.showSnackbar("El nombre de usuario ya esta en uso")
            this.new_username = ''
            //alert("El nombre de usuario ya esta en uso")
          } else {
            // doc.data() will be undefined in this case
            // Add user into database
            db.collection("usuarios").doc(this.new_username).set({
              nombre: this.new_firstname,
              apellidos: this.new_lastname,
              fecha_nac: this.new_birth,
              pais: this.new_country,
              email: this.new_email,
              usuario: this.new_username,
              admin: false
            })

            // Create new user
            firebase.auth().createUserWithEmailAndPassword(this.new_email, this.new_password).then(() => {
              // Signed in
              /*
              const db = firebase.firestore()
              let user = firebase.auth().currentUser

              if(user !== null){
                db.collection('usuarios').where('email', '==', user.email).get().then((querySnapshot) =>{
                  querySnapshot.forEach((doc) => {
                    localStorage.setItem('USER_NAME', doc.data().usuario)
                    localStorage.setItem('PERMISSION', doc.data().admin)
                  })
                }).catch((error) => {
                  console.log("Error getting documents: ", error)
                })
              }

               */
              this.$router.replace('/home')
            }).catch((error) => {
              console.log(error)
              this.showSnackbar("Ups!! Algo fallo. Compruebe que todos los campos sean correctos")
            });
          }
        }).catch(() => {
          this.showSnackbar("Ups!! Algo fallo. Vuelva a rellenar los campos")
          //console.log("Error getting document:", error);
        })
      }
    },
    /**********************************************
     *
     * Go back to login
     *
     *********************************************/
    // @vuese
    // Used to go to the login page
    back(){
      this.$router.replace("/login")
    },

    // @vuese
    // Used to show snackbar alert
    // @arg The argument is a string value representing the displayed text
    showSnackbar(cad){
      this.snackbar_text = cad
      this.snackbar =! this.snackbar
    }
  }
}
</script>

<style scoped>

.sign-up {
  margin: 0% 5%;
  padding: 10px;
  border-radius: 12px;
  background-color: white;
}

img{
  width: 30%;
}

#form_signup{
  margin-left: 10%;
  margin-right: 10%;
}

#buttons_container{
  display: inline-block;
  margin: 0 5%;
  width: 90%;
  padding: 0 5% 5% 5%;
}
.button{
  color: white !important;
  border: none;
  cursor: pointer;
  display: block;
  border-radius: 28px;
  min-width: 100px;
  float: right;
}

#button_accept{
  background-color: #EE0000;
  margin-left: 10%;
  margin-right: 5%;
}

#button_cancel{
  background-color: #212121;
}

button:hover {
  opacity: 0.8;
  cursor: pointer;
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