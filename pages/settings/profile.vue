<template>
  <TwoColumnContainer
    :left-cols="12"
    :left-sm="4"
    :right-cols="12"
    :right-sm="8"
  >
    <template #top>
      <TheLoading v-if="loading" />
      <TheMessage v-if="!loading" :alert="alert" :notice="notice" />
      <AddressSettingInfo v-if="!loading" />
    </template>

    <template v-if="!loading" #left>
      <SettingsMenusCard />
    </template>

    <template v-if="!loading" #right>
      <SettingsProfileCard @alert="alert = $event" @notice="notice = $event" />
    </template>
  </TwoColumnContainer>
</template>

<script>
import Application from '~/plugins/application.js'
import TwoColumnContainer from '~/components/molecules/containers/TwoColumnContainer.vue'
import AddressSettingInfo from '~/components/molecules/alert/AddressSettingInfo.vue'
import TheLoading from '~/components/organisms/application/TheLoading.vue'
import TheMessage from '~/components/organisms/application/TheMessage.vue'
import SettingsMenusCard from '~/components/organisms/cards/settings/SettingsMenusCard.vue'
import SettingsProfileCard from '~/components/organisms/cards/settings/SettingsProfileCard.vue'

export default {
  name: 'SettingsProfile',

  components: {
    TwoColumnContainer,
    AddressSettingInfo,
    TheLoading,
    TheMessage,
    SettingsMenusCard,
    SettingsProfileCard
  },

  mixins: [Application],

  async created () {
    try {
      await this.$auth.fetchUser()
    } catch (error) {
      if (error.response == null) {
        this.$toasted.error(this.$t('network.failure'))
      } else if (error.response.status === 401) {
        return this.signOut()
      } else {
        this.$toasted.error(this.$t('network.error'))
      }
      return this.$router.push({ path: '/home' })
    }

    if (!this.$auth.loggedIn) {
      return this.redirectAuth()
    }

    this.loading = false
  }
}
</script>
