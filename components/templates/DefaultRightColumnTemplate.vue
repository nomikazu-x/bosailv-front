<template>
  <div>
    <div v-if="$auth.loggedIn" class="mb-4">
      <AuthUserIntroCard />
    </div>
    <div v-else class="mb-4">
      <SignupSuggestCard />
    </div>
    <div class="mb-4">
      <ImportantInfomationListCard />
    </div>
    <div class="mb-4">
      <ArticleRankingUpperFiveCard />
    </div>
    <div class="mb-4">
      <UserRankingUpperTenCard />
    </div>
  </div>
</template>

<script>
import AuthUserIntroCard from '~/components/organisms/cards/user/AuthUserIntroCard.vue'
import SignupSuggestCard from '~/components/organisms/cards/SignupSuggestCard.vue'
import ImportantInfomationListCard from '~/components/organisms/cards/infomation/ImportantInfomationListCard.vue'
import ArticleRankingUpperFiveCard from '~/components/organisms/cards/article/ArticleRankingUpperFiveCard.vue'
import UserRankingUpperTenCard from '~/components/organisms/cards/user/UserRankingUpperTenCard.vue'

export default {
  name: 'DefaultRightColumnTemplate',

  components: {
    AuthUserIntroCard,
    SignupSuggestCard,
    ImportantInfomationListCard,
    ArticleRankingUpperFiveCard,
    UserRankingUpperTenCard
  }
}
</script>
