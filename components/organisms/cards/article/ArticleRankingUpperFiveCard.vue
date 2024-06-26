<template>
  <BaseTitleCard v-if="famousArticles != null && famousArticles.length > 0" class="pb-1" title="人気記事">
    <div
      v-for="(article, index) in famousArticles.slice(0, 5)"
      :key="article.id"
      :article="article"
      :index="index"
    >
      <BaseCard :to="{ name: 'articles-id___ja', params: { id: article.id }}" class="my-2">
        <div v-if="[0, 1, 2].includes(index)">
          <v-icon v-if="index === 0" style="color: #ffc400; position: absolute; z-index: 1;" large class="ma-1">
            mdi-medal-outline
          </v-icon>
          <v-icon v-if="index === 1" style="color: #c9c9c9; position: absolute; z-index: 1;" large class="ma-1">
            mdi-medal-outline
          </v-icon>
          <v-icon v-if="index === 2" style="color: #ac6d4d; position: absolute; z-index: 1;" large class="ma-1">
            mdi-medal-outline
          </v-icon>
        </div>
        <div v-else>
          <v-icon style="position: absolute; z-index: 1;" large class="ma-1">
            {{ index + 1 }}
          </v-icon>
        </div>
        <v-row align="center">
          <v-col cols="4" sm="4">
            <v-img :src="article.thumbnail_url.large" max-height="128" max-width="192" class="ml-2 rounded-lg" />
          </v-col>
          <v-col cols="8" sm="8">
            <v-card-subtitle v-if="$vuetify.breakpoint.smAndUp" class="font-weight-bold">
              {{ article.title }}
            </v-card-subtitle>
            <v-card-title v-else>
              {{ article.title }}
            </v-card-title>
            <v-card-text class="mt-2 text-right d-sm-none">
              <v-icon small>mdi-calendar-range</v-icon>
              {{ $dateFormat(article.created_at, 'ja') }}
            </v-card-text>
          </v-col>
        </v-row>
      </BaseCard>
    </div>
    <GreenBtn
      large
      class="mt-6 mb-2"
      outlined
      block
      to="/articles"
    >
      記事をもっと見る
    </GreenBtn>
  </BaseTitleCard>
</template>

<script>
import BaseTitleCard from '~/components/molecules/cards/BaseTitleCard.vue'
import BaseCard from '~/components/molecules/cards/BaseCard.vue'
import GreenBtn from '~/components/atoms/btns/GreenBtn.vue'

export default {
  name: 'ArticleRankingUpperFiveCard',

  components: {
    BaseTitleCard,
    BaseCard,
    GreenBtn
  },

  data () {
    return {
      famousArticles: null
    }
  },
  async created () {
    await this.$axios.get(this.$config.apiBaseURL + this.$config.articlesUrl, {
      params: { famous: true }
    })
      .then((response) => {
        if (response.data == null || response.data.article == null) {
          this.$toasted.error(this.$t('system.error'))
          return this.$router.push({ path: '/home' })
        } else {
          this.famousArticles = response.data.articles
        }
      },
      (error) => {
        this.$toasted.error(this.$t(error.response == null ? 'network.failure' : 'network.error'))
        return this.$router.push({ path: '/home' })
      })
  }
}
</script>
