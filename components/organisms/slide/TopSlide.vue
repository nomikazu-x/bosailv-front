<template>
  <v-sheet v-if="articles != null" style="background-color: #f9f5eb;">
    <v-slide-group
      multiple
      show-arrows
      center-active
    >
      <v-slide-item>
        <v-card to="/about" class="ma-1" style="background-color: #fff;" max-width="500" height="300">
          <v-card-title style="background-color: #fff; margin-top: 93px;">
            <v-img :src="image.LOGO_IMAGE" max-width="300" />ってなに？
          </v-card-title>
        </v-card>
      </v-slide-item>
      <v-slide-item
        v-for="article in articles.slice(0, 5)"
        :key="article.id"
      >
        <v-card :to="{ name: 'articles-id___ja', params: { id: article.id }}" class="ma-1" style="width: 500px; height: 300px;">
          <v-img :src="article.thumbnail_url.xxlarge" class="white--text align-end" height="300px">
            <div class="article-title">
              <v-card-title v-text="article.title" />
              <v-card-text>
                <v-icon color="white" small>mdi-calendar-range-outline</v-icon>
                {{ $dateFormat(article.created_at, 'ja') }}
              </v-card-text>
            </div>
          </v-img>
        </v-card>
      </v-slide-item>
    </v-slide-group>
  </v-sheet>
</template>

<script>
import LOGO_IMAGE from '~/assets/images/logo.jpg'

export default {
  name: 'TopSlide',
  data () {
    return {
      articles: null
    }
  },

  computed: {
    image () {
      return {
        LOGO_IMAGE
      }
    }
  },

  async created () {
    await this.$axios.get(this.$config.apiBaseURL + this.$config.articlesUrl)
      .then((response) => {
        if (response.data == null || response.data.article == null) {
          this.$toasted.error(this.$t('system.error'))
          return this.$router.push({ path: '/home' })
        } else {
          this.articles = response.data.articles
        }
      },
      (error) => {
        this.$toasted.error(this.$t(error.response == null ? 'network.failure' : 'network.error'))
        return this.$router.push({ path: '/home' })
      })
  }
}
</script>

<style lang="scss" scoped>
.article-title {
  background: rgba(0, 0, 0, 0.3);
  height: 90px;
}
</style>
