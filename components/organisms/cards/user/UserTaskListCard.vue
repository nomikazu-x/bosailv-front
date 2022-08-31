<template>
  <div v-if="tasks != null">
    <BaseTitleCard title="防災タスク一覧" style="background-color: #f9f5eb;" />
    <TaskListCardText
      v-for="task in constantTasks"
      :key="`first-${task.id}`"
      :task="task"
      :to="task.to"
      class="mt-2"
    />
    <TaskListCardText
      v-for="task in tasks"
      :key="`second-${task.id}`"
      :task="task"
      :to="toTask(task)"
      class="mt-2"
    />
  </div>
</template>

<script>
import Application from '~/plugins/application.js'
import BaseTitleCard from '~/components/molecules/cards/BaseTitleCard.vue'
import TaskListCardText from '~/components/organisms/cardText/TaskListCardText.vue'

export default {
  name: 'TaskListCard',

  components: {
    BaseTitleCard,
    TaskListCardText
  },

  mixins: [Application],

  data () {
    return {
      constantTasks: [
        { id: 1, to: '/sns_tasks', is_completed: this.$auth.user.is_completed_sns_tasks, icon: 'mdi-twitter', title: '防災SNS', summary: '防災SNSをフォローしてもしものときに備えよう。' },
        { id: 2, to: '/house_tasks', is_completed: this.$auth.user.is_completed_house_tasks, icon: 'mdi-home', title: '家具の固定', summary: '家具類の転倒・落下・移動防止対策をしてもしものときに備えよう。' },
        { id: 3, to: this.toFamilyRule(), is_completed: this.$auth.user.is_completed_family_rules_tasks, icon: 'mdi-human-male-female-child', title: '家族会議', summary: '災害に備えて家族でルールを決めておきましょう。' },
        { id: 4, to: '/emergency_contacts', is_completed: this.$auth.user.is_completed_emergency_contact_task, icon: 'mdi-phone-in-talk', title: '緊急連絡先', summary: '緊急時にそなえて連絡先を登録しておこう。' },
        { id: 5, to: this.toStock(), is_completed: this.$auth.user.is_completed_stock_tasks, icon: 'mdi-archive', title: '備蓄', summary: '家族構成を登録して、必要な備蓄品を備蓄しておこう。' }
      ],
      tasks: null
    }
  },

  computed: {
    toTask () {
      return (task) => {
        if (this.$route.path === '/admin/tasks') {
          return { name: 'admin-tasks-id-edit___ja', params: { id: task.id } }
        } else {
          return { name: 'tasks-id___ja', params: { id: task.id } }
        }
      }
    }
  },

  async created () {
    await this.$axios.get(this.$config.apiBaseURL + this.$config.tasksUrl, {
      params: { username: this.$route.params.username }
    })
      .then((response) => {
        if (response.data == null) {
          this.$toasted.error(this.$t('system.error'))
          this.tasks = null
        } else {
          this.tasks = response.data.tasks
        }
      },
      (error) => {
        this.$toasted.error(this.$t(error.response == null ? 'network.failure' : 'network.error'))
      })

    this.processing = false
  },

  methods: {
    toFamilyRule () {
      if (this.$auth.user.is_completed_family_rules_tasks) {
        return '/family_rule'
      } else {
        return '/family_rule/edit'
      }
    },
    toStock () {
      if (this.$auth.user.is_family_present) {
        return '/stocks'
      } else {
        return '/stocks/edit'
      }
    }
  }
}
</script>