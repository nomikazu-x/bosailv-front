<template>
  <span>
    <TheProcessing v-if="processing" />
    <v-btn v-if="isFavorited" x-large outlined icon color="red" @click="onUnFavorite($auth.user.id)">
      <v-icon size="30" color="red">mdi-heart</v-icon>
    </v-btn>
    <v-btn v-else x-large outlined icon :disabled="disabled" @click="onFavorite">
      <v-icon size="30" color="red">mdi-heart-outline</v-icon>
    </v-btn>
    <span><NuxtLink :to="`/articles/${$route.params.id}/likers`" class="text-decoration-none">{{ likers.length }}</NuxtLink></span>
  </span>
</template>

<script>
import Application from '~/plugins/application.js'

export default {
  name: 'FavoriteBtnGroup',
  mixins: [Application],
  props: {
    article: {
      type: Object,
      default: null
    },
    likers: {
      type: Array,
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      isFavorited: this.article.is_favorited
    }
  },

  created () {
    this.processing = false
  },

  methods: {
    async onFavorite () {
      this.processing = true

      await this.$axios.post(this.$config.apiBaseURL + this.$config.favoriteCreateUrl.replace('_id', this.$route.params.id))
        .then((response) => {
          if (response.data == null) {
            this.$toasted.error(this.$t('system.error'))
          } else if (this.$auth.loggedIn) {
            this.$store.commit('articles/addLikers', this.$auth.user, { root: true })
            this.$store.commit('user/setLevel', response.data.user.level, { root: true })
            this.$auth.setUser(response.data.user)
            this.isFavorited = true
            this.$toasted.success(response.data.notice)
          } else {
            return this.redirectSignIn(response.data.alert, response.data.notice)
          }
        },
        (error) => {
          if (error.response == null) {
            this.$toasted.error(this.$t('network.failure'))
          } else if (error.response.status === 401) {
            return this.signOut()
          } else if (error.response.data == null) {
            this.$toasted.error(this.$t('network.error'))
          } else {
            this.$emit('alert', error.response.data.alert)
            this.$emit('notice', error.response.data.notice)
          }
        })

      this.processing = false
    },

    async onUnFavorite (likerId) {
      this.processing = true

      await this.$axios.post(this.$config.apiBaseURL + this.$config.favoriteDeleteUrl.replace('_id', this.$route.params.id))
        .then((response) => {
          if (response.data == null) {
            this.$toasted.error(this.$t('system.error'))
          } else if (this.$auth.loggedIn) {
            this.$store.commit('articles/deleteLiker', likerId, { root: true })
            this.$auth.setUser(response.data.user)
            this.isFavorited = false
            this.$toasted.success(response.data.notice)
          } else {
            return this.redirectSignIn(response.data.alert, response.data.notice)
          }
        },
        (error) => {
          if (error.response == null) {
            this.$toasted.error(this.$t('network.failure'))
          } else if (error.response.status === 401) {
            return this.signOut()
          } else if (error.response.data == null) {
            this.$toasted.error(this.$t('network.error'))
          } else {
            this.$emit('alert', error.response.data.alert)
            this.$emit('notice', error.response.data.notice)
          }
        })

      this.processing = false
    }
  }
}
</script>
