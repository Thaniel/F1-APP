<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" persistent max-width="290">
      <v-card>
        <v-card-title class="text-h5"> {{ title }} </v-card-title>
        <v-card-text class="text-left"> {{ text }} </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="black darken-1" text @click.stop="onClickButton(-1)">Cancelar</v-btn>
          <v-btn color="blue darken-1" text @click.stop="onClickButton(0)">Confirmar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
export default {
  props: ['visible'],
  computed: {
    show: {
      get () {
        return this.visible
      },
      set (value) {
        if (!value) {
          this.$emit('close')
        }
      }
    }
  },
  methods: {
    // @vuese
    // Used to show the dialog component
    // @arg The arguments two strings value representing the displayed title and text
    active(title_dialog, text_dialog){
      this.title = title_dialog
      this.text = text_dialog
      this.dialog = !this.dialog
    },

    // @vuese
    // Used to get user action
    onClickButton (x) {
      this.dialog = false
      if(x == -1)
          // Fire when the user select an option
          // @arg The argument is a boolean value representing the cancellation
        this.$emit('clicked', 'cancel')
      else
          // Fire when the user select an option
          // @arg The argument is a string value representing the confirmation
        this.$emit('clicked', 'accept')
    }
  },
  name: "Dialog-view",
  data(){
    return {
      title: 'title',
      text: 'text',
      dialog: false,
    }
  },
}
</script>

<style scoped>
.text-h5{
  font-family: "F1 Regular" !important;
}

</style>