<template>
  <ValidationObserver v-slot="{ invalid }" ref="observer">
    <TheProcessing v-if="processing" />
    <v-form autocomplete="off">
      <v-card-text>
        <BaseTextField
          v-model="name"
          label="連絡先名"
          rules="required|max:20"
          @click="waiting = false"
        />
        <BaseTextField
          v-model="phoneNumber"
          label="電話番号"
          :rules="{ required: true, regex: /^0(\d{1}[-(]?\d{4}|\d{2}[-(]?\d{3}|\d{3}[-(]?\d{2}|\d{4}[-(]?\d{1})[-)]?\d{4}$|^0[5789]0[-]?\d{4}[-]?\d{4}$/ }"
          @click="waiting = false"
        />
        <div v-if="$auth.user.is_max_emergency_contact" class="text-center text-caption mt-2 grey--text">
          ※登録上限数に達しているため、登録できません。
        </div>
        <div class="text-center">
          <OrangeBtn id="emergency_contact_create_btn" :disabled="invalid || processing || waiting || $auth.user.is_max_emergency_contact" @click="onEmergencyContactCreate">作成</OrangeBtn>
        </div>
      </v-card-text>
    </v-form>
  </ValidationObserver>
</template>

<script>
import { ValidationObserver, extend, configure, localize } from 'vee-validate'
import { required, regex } from 'vee-validate/dist/rules'
import Application from '~/plugins/application.js'
import BaseTextField from '~/components/molecules/textFields/BaseTextField.vue'
import OrangeBtn from '~/components/atoms/btns/OrangeBtn.vue'

extend('required', required)
extend('regex', regex)
configure({ generateMessage: localize('ja', require('~/locales/validate.ja.js')) })

export default {
  name: 'EmergencyContactForm',

  components: {
    ValidationObserver,
    BaseTextField,
    OrangeBtn
  },

  mixins: [Application],

  data () {
    return {
      waiting: false,
      name: '',
      phoneNumber: ''
    }
  },

  created () {
    this.processing = false
  },

  methods: {
    async onEmergencyContactCreate () {
      this.processing = true

      await this.$axios.post(this.$config.apiBaseURL + this.$config.emergencyContactCreateUrl, {
        name: this.name,
        phone_number: this.phoneNumber
      })
        .then((response) => {
          if (response.data == null) {
            this.$toasted.error(this.$t('system.error'))
          } else {
            this.$store.commit('user/setLevel', response.data.user.level, { root: true })
            this.$auth.setUser(response.data.user)
            this.$store.commit('emergencyContacts/addEmergencyContacts', response.data.emergency_contact, { root: true })
            this.name = ''
            this.phoneNumber = ''
            this.$refs.observer.reset()
            this.$toasted.error(response.data.alert)
            this.$toasted.success(response.data.notice)
          }
        },
        (error) => {
          if (error.response == null) {
            this.$toasted.error(this.$t('network.failure'))
          } else if (error.response.data == null) {
            this.$toasted.error(this.$t('network.error'))
          } else {
            this.$emit('alert', error.response.data.alert)
            this.$emit('notice', error.response.data.notice)
            if (error.response.data.errors != null) {
              this.$refs.observer.setErrors(error.response.data.errors)
              this.waiting = true
            }
          }
        })

      this.processing = false
    }
  }
}
</script>
