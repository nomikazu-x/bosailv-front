import Vuetify from 'vuetify'
import { createLocalVue, mount } from '@vue/test-utils'
import locales from '~/locales/ja.js'
import BaseTitleCard from '~/components/molecules/cards/BaseTitleCard.vue'
import UserEmailForm from '~/components/organisms/form/UserEmailForm.vue'
import Component from '~/components/organisms/cards/settings/SettingsEmailCard.vue'

import { Helper } from '~/test/helper.js'
const helper = new Helper()

describe('SettingsEmailCard.vue', () => {
  let axiosGetMock, axiosPostMock, authSetUserMock, authLogoutMock, toastedErrorMock, toastedSuccessMock, routerPushMock

  beforeEach(() => {
    axiosGetMock = jest.fn()
    axiosPostMock = null
    authSetUserMock = jest.fn()
    authLogoutMock = jest.fn()
    toastedErrorMock = jest.fn()
    toastedSuccessMock = jest.fn()
    routerPushMock = jest.fn()
  })

  const mountFunction = (loggedIn, user, values = null) => {
    const localVue = createLocalVue()
    const vuetify = new Vuetify()
    const wrapper = mount(Component, {
      localVue,
      vuetify,
      stubs: {
        BaseTitleCard: true,
        UserEmailForm: true
      },
      mocks: {
        $config: {
          apiBaseURL: 'https://example.com',
          userShowUrl: '/api/v1/users/_username.json',
          userUpdateUrl: '/api/v1/auth/update.json',
          frontBaseURL: 'https://front.example.com',
          confirmationSuccessUrl: '/signin'
        },
        $axios: {
          get: axiosGetMock,
          post: axiosPostMock
        },
        $auth: {
          loggedIn,
          setUser: authSetUserMock,
          user: { ...user },
          logout: authLogoutMock
        },
        $toasted: {
          error: toastedErrorMock,
          success: toastedSuccessMock
        },
        $router: {
          push: routerPushMock
        }
      },
      data () {
        return { ...values }
      }
    })
    expect(wrapper.vm).toBeTruthy()
    return wrapper
  }
  const commonMessageTest = (wrapper, alert, notice) => {
    expect(wrapper.emitted().alert).toEqual([[alert]])
    expect(wrapper.emitted().notice).toEqual([[notice]])
  }
  const commonViewTest = (wrapper, user) => {
    // console.log(wrapper.html())
    expect(wrapper.findComponent(BaseTitleCard).exists()).toBe(true)
    expect(wrapper.findComponent(UserEmailForm).exists()).toBe(true)
    expect(wrapper.findComponent(UserEmailForm).vm.$props.processing).toBe(false)
    expect(wrapper.findComponent(UserEmailForm).vm.$props.user).toBe(user)
  }
  const commonToastedTest = (alert, notice) => {
    expect(toastedErrorMock).toBeCalledTimes(alert !== null ? 1 : 0)
    if (alert !== null) {
      expect(toastedErrorMock).toBeCalledWith(alert)
    }
    expect(toastedSuccessMock).toBeCalledTimes(notice !== null ? 1 : 0)
    if (notice !== null) {
      expect(toastedSuccessMock).toBeCalledWith(notice)
    }
  }
  const commonRedirectTest = (url) => {
    expect(routerPushMock).toBeCalledTimes(1)
    expect(routerPushMock).toBeCalledWith(url)
  }
  const commonGetApiCalledTest = (logoutCalled) => {
    expect(axiosGetMock).toBeCalledTimes(1)
    expect(axiosGetMock).toBeCalledWith('https://example.com/api/v1/users/12345.json')
    expect(authLogoutMock).toBeCalledTimes(logoutCalled)
  }
  const commonPostApiCalledTest = (values, setUserCalled, logoutCalled) => {
    expect(axiosPostMock).toBeCalledTimes(1)
    expect(axiosPostMock).toBeCalledWith('https://example.com/api/v1/auth/update.json', {
      email: values.email,
      current_password: values.current_password,
      confirm_redirect_url: 'https://front.example.com/signin'
    })
    expect(authSetUserMock).toBeCalledTimes(setUserCalled)
    expect(authLogoutMock).toBeCalledTimes(logoutCalled)
  }

  describe('ユーザー情報詳細API', () => {
    const user = Object.freeze({ username: '12345' })
    it('[接続エラー]トップページにリダイレクトされる', async () => {
      axiosGetMock = jest.fn(() => Promise.reject({ response: null }))
      mountFunction(true, user)

      await helper.sleep(1)
      commonGetApiCalledTest(0)
      commonToastedTest(locales.network.failure, null)
      commonRedirectTest({ path: '/' })
    })
    it('[認証エラー]未ログイン状態になり、ログインページにリダイレクトされる', async () => {
      axiosGetMock = jest.fn(() => Promise.reject({ response: { status: 401 } }))
      mountFunction(true, user)

      await helper.sleep(1)
      commonGetApiCalledTest(1)
      commonToastedTest(null, locales.auth.unauthenticated)
      // Tips: 状態変更・リダイレクトのテストは省略（Mockでは実行されない為）
    })
    it('[レスポンスエラー]トップページにリダイレクトされる', async () => {
      axiosGetMock = jest.fn(() => Promise.reject({ response: { status: 500 } }))
      mountFunction(true, user)

      await helper.sleep(1)
      commonGetApiCalledTest(0)
      commonToastedTest(locales.network.error, null)
      commonRedirectTest({ path: '/' })
    })
    it('[データなし]トップページにリダイレクトされる', async () => {
      axiosGetMock = jest.fn(() => Promise.resolve({ data: null }))
      mountFunction(true, user)

      await helper.sleep(1)
      commonGetApiCalledTest(0)
      commonToastedTest(locales.system.error, null)
      commonRedirectTest({ path: '/' })
    })
  })

  describe('ユーザー情報編集API', () => {
    const data = Object.freeze({ alert: 'alertメッセージ', notice: 'noticeメッセージ' })
    const user = Object.freeze({ name: 'user1の氏名', email: 'user1@example.com', username: '12345' })
    const values = Object.freeze({ email: 'update@example.com', current_password: 'abc12345' })

    it('[成功]トップページにリダイレクトされる', async () => {
      axiosGetMock = jest.fn(() => Promise.resolve({ data: { user } }))
      axiosPostMock = jest.fn(() => Promise.resolve({ data }))
      const wrapper = mountFunction(true, user, values)

      await helper.sleep(1)
      commonGetApiCalledTest(0)
      commonViewTest(wrapper, user)

      wrapper.findComponent(UserEmailForm).vm.$emit('user-update', values)
      await helper.sleep(1)
      commonPostApiCalledTest(values, 1, 0)
      commonToastedTest(data.alert, data.notice)
      commonRedirectTest({ path: '/' })
    })

    it('[成功]未ログイン状態になってしまった場合は、ログインページにリダイレクトされる', async () => {
      axiosGetMock = jest.fn(() => Promise.resolve({ data: { user } }))
      axiosPostMock = jest.fn(() => Promise.resolve({ data }))
      const wrapper = mountFunction(true, user, values)

      await helper.sleep(1)
      commonGetApiCalledTest(0)
      commonViewTest(wrapper, user)

      wrapper.findComponent(UserEmailForm).vm.$emit('user-update', values)
      wrapper.vm.$auth.loggedIn = false // Tips: 状態変更（Mockでは実行されない為）

      await helper.sleep(1)
      commonPostApiCalledTest(values, 1, 0)
      commonRedirectTest({ path: '/signin', query: { alert: data.alert, notice: data.notice } })
    })

    it('[入力エラー]エラーメッセージが表示される', async () => {
      axiosGetMock = jest.fn(() => Promise.resolve({ data: { user } }))
      axiosPostMock = jest.fn(() => Promise.reject({ response: { status: 422, data: Object.assign({ errors: { email: ['errorメッセージ'] } }, data) } }))
      const wrapper = mountFunction(true, user, values)

      await helper.sleep(1)
      commonGetApiCalledTest(0)
      commonViewTest(wrapper, user)

      wrapper.findComponent(UserEmailForm).vm.$emit('user-update', values)

      await helper.sleep(1)
      commonPostApiCalledTest(values, 0, 0)
      commonMessageTest(wrapper, data.alert, data.notice)
    })

    it('[連携エラー]エラーメッセージが表示される', async () => {
      axiosGetMock = jest.fn(() => Promise.resolve({ data: { user } }))
      axiosPostMock = jest.fn(() => Promise.reject({ response: { status: 422, data: Object.assign({ errors: null }, data) } }))
      const wrapper = mountFunction(true, user, values)

      await helper.sleep(1)
      commonGetApiCalledTest(0)
      commonViewTest(wrapper, user)

      wrapper.findComponent(UserEmailForm).vm.$emit('user-update', values)

      await helper.sleep(1)
      commonPostApiCalledTest(values, 0, 0)
      commonMessageTest(wrapper, data.alert, data.notice)
    })

    it('[接続エラー]エラーメッセージが表示される', async () => {
      axiosGetMock = jest.fn(() => Promise.resolve({ data: { user } }))
      axiosPostMock = jest.fn(() => Promise.reject({ response: null }))
      const wrapper = mountFunction(true, user, values)

      await helper.sleep(1)
      commonGetApiCalledTest(0)
      commonViewTest(wrapper, user)

      wrapper.findComponent(UserEmailForm).vm.$emit('user-update', values)

      await helper.sleep(1)
      commonPostApiCalledTest(values, 0, 0)
      commonToastedTest(locales.network.failure, null)
    })

    it('[認証エラー]未ログイン状態になり、ログインページにリダイレクトされる', async () => {
      axiosGetMock = jest.fn(() => Promise.resolve({ data: { user } }))
      axiosPostMock = jest.fn(() => Promise.reject({ response: { status: 401 } }))
      const wrapper = mountFunction(true, user, values)

      await helper.sleep(1)
      commonGetApiCalledTest(0)
      commonViewTest(wrapper, user)

      wrapper.findComponent(UserEmailForm).vm.$emit('user-update', values)

      await helper.sleep(1)
      commonPostApiCalledTest(values, 0, 1)
      commonToastedTest(null, locales.auth.unauthenticated)
      // Tips: 状態変更・リダイレクトのテストは省略（Mockでは実行されない為）
    })

    it('[レスポンスエラー]エラーメッセージが表示される', async () => {
      axiosGetMock = jest.fn(() => Promise.resolve({ data: { user } }))
      axiosPostMock = jest.fn(() => Promise.reject({ response: { status: 500 } }))
      const wrapper = mountFunction(true, user, values)

      await helper.sleep(1)
      commonGetApiCalledTest(0)
      commonViewTest(wrapper, user)

      wrapper.findComponent(UserEmailForm).vm.$emit('user-update', values)

      await helper.sleep(1)
      commonPostApiCalledTest(values, 0, 0)
      commonToastedTest(locales.network.error, null)
    })

    it('[データなし]エラーメッセージが表示される', async () => {
      axiosGetMock = jest.fn(() => Promise.resolve({ data: { user } }))
      axiosPostMock = jest.fn(() => Promise.resolve({ data: null }))
      const wrapper = mountFunction(true, user, values)

      await helper.sleep(1)
      commonGetApiCalledTest(0)
      commonViewTest(wrapper, user)

      wrapper.findComponent(UserEmailForm).vm.$emit('user-update', values)

      await helper.sleep(1)
      commonPostApiCalledTest(values, 0, 0)
      commonToastedTest(locales.system.error, null)
    })
  })
})
