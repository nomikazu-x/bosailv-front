<template>
  <v-card-text>
    <v-dialog transition="dialog-top-transition" max-width="600px">
      <template #activator="{ on, attrs }">
        <v-btn color="error" v-bind="attrs" v-on="on">{{ name }}</v-btn>
      </template>
      <template #default="dialog">
        <v-card>
          <v-toolbar color="error" dark>{{ title }}</v-toolbar>
          <v-card-text>
            <div class="text-h6 pa-6">本当に削除しますか？</div>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn color="secondary" @click="dialog.value = false">いいえ</v-btn>
            <v-btn color="error" @click="dialog.value = false; onClick()">はい</v-btn>
          </v-card-actions>
        </v-card>
      </template>
    </v-dialog>
  </v-card-text>
</template>

<script>
export default {
  props: {
    name: {
      type: String,
      default: '削除'
    },
    title: {
      type: String,
      default: '削除'
    }
  },
  methods: {
    onClick () {
      this.$emit('click')
    }
  }
}
</script>
