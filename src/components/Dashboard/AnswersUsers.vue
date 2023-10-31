<template>
  <v-card outlined width="100%" height="100%" class="tests-table">
    <v-data-table
      hide-default-footer
      class="dashboard-tests-table"
      height="100%"
      style="height: calc(100% - 52px) !important;"
      :loading-text="$t('TEST.loading_quizzes')"
      :no-data-text="$t('TEST.no_quizzes')"
      :headers="
        headers.map(h => ({
          ...h,
          text: h.text,
        }))
      "
      :items="tests"
      :loading="loading"
      :item-class="itemRowStyle"
      @click:row="onRowClick"
    >
      <template v-slot:top>
        <v-toolbar dense flat color="white" class="mt-1">
          <h1 class="table-title">
            Answered quizzes
          </h1>
        </v-toolbar>

        <div class="title-divider" />
      </template>

      <template v-slot:[`item.type`]="{ item }">
        <div class="type-container">
          <div
            class="icon-container"
            :style="{ backgroundColor: getItemIconColor(item) + '44' }"
          >
            <v-icon
              v-if="item.type === 'selected'"
              size="20"
              :color="getItemIconColor(item)"
              >{{ mdiCheckboxMultipleMarked }}</v-icon
            >

            <v-icon
              v-else-if="item.type === 'random'"
              size="20"
              :color="getItemIconColor(item)"
            >
              {{ mdiShuffleVariant }}
            </v-icon>

            <v-icon v-else size="20" :color="getItemIconColor(item)">
              {{ mdiArrowDecisionAutoOutline }}
            </v-icon>
          </div>

          <span class="type-text">
            {{ $t('TEST.TYPE.' + item.type) }}
          </span>
        </div>
      </template>

      <template v-slot:[`item.level`]="{ item }">
        <span
          class="font-weight-medium"
          :class="getLevel(item).color + '--text'"
        >
          <v-icon size="20" class="mr-1" :color="getLevel(item).color">{{
            mdiDumbbell
          }}</v-icon>

          {{ $t('TEST.LEVEL.' + getLevel(item).label) }}
        </span>
      </template>

      <template v-slot:[`item.date`]="{ item }">
        {{ item.date }}
      </template>

      <template v-slot:[`item.approve`]="{ item }">
        <div class="type-container">
          <div
            class="icon-container"
           
          >
           

            <v-icon size="20" :color="getItemIconColorApprove(item)">
              {{ mdiCheckboxMultipleMarked }}
            </v-icon>
          </div>

          <span class="type-text" >
            {{ (item.approve?'Aprovado':'Reprovado') }}
          </span>
        </div>
      </template>
      <template v-slot:[`item.review`]="{ item }">
      <v-btn text small color="blue" @click="reviewAttempt(item)">
        {{ $t('TEST.ATTEMPTS.HEADERS.review') }}
      </v-btn>
    </template>
    </v-data-table>
  </v-card>
</template>

<script>
import {
  mdiCheckboxMultipleMarked,
  mdiShuffleVariant,
  mdiArrowDecisionAutoOutline,
  mdiDumbbell,
} from '@mdi/js'
import { db, storage,analytics } from '../../api/firebase'


export default {
  name: 'AnswersUsers',
  mounted(){
    const collectionRef = db.collection('answersUsers')
    collectionRef.get()
    .then((querySnapshot) => {
      const documentos = [];
      querySnapshot.forEach((doc) => {
        documentos.push(doc.data());
      });
      this.tests = documentos.map((el) => {
        const q = el.quiz
        let total = 0
        let correct = 0
        let approve = false
        return {
          answers: el.answers.map((a) => {
            return {
              answers:a.answers.map((f) => {
                total = total + 1
                if(f.value){
                  correct = correct + 1
                }
                return {
                  ansId:f.ansId,
                  text:f.text,
                  value:f.value
                }
              }),
              question:a.question
            }
          }),
            date: el.date.split('-')[2].substring(0,2)+'/'+el.date.split('-')[1]+'/'+el.date.split('-')[0],
            approve:(correct / total) * 100 >= q.approvalPercentage ? true : false,
            approvalPercentage: q.approvalPercentage,
            created: q.created,
            instructions: q.instructions,
            level: q.level,
            query: q.query,
            questions: q.questions,
            questionsAmount: q.questionsAmount,
            questionsNames: q.questionsNames,
            subjects: q.subjects,
            time: q.time,
            title: q.title,
            toDelete: q.toDelete,
            type: q.type,
            unlimitedTime: q.unlimitedTime,
            updated: q.updated,
            userAttempts: q.userAttempts,
            userId: q.userId,
            uuid: q.uuid,
            userNome:el.user.nome,
            userEmail:el.user.email

          
        }
      });

    })
    .catch((error) => {
      console.error('Erro ao buscar documentos:', error);
    });
  },
  data() {
    return {
      headers: [
        { text: 'User', sortable: false, value: 'userNome', align: 'center' },
        { text: 'Title', sortable: false, value: 'title', align: 'center' },
        {
          text: 'questions_amount',
          sortable: false,
          value: 'questionsAmount',
          align: 'center',
        },
        { text: 'level', sortable: false, value: 'level', align: 'center' },
        {
          text: 'last_update',
          sortable: false,
          value: 'date',
          align: 'center',
        },
        {
          text: 'result',
          sortable: false,
          value: 'approve',
          align: 'center',
        },
        {
          text: 'review',
          sortable: false,
          value: 'review',
          align: 'center',
        },
      ],
      
      mdiCheckboxMultipleMarked,
      mdiShuffleVariant,
      mdiArrowDecisionAutoOutline,
      mdiDumbbell,
      tests:[]
    }
  },
  computed: {
    
    loading() {
      return this.$store.getters.loading
    },
    months() {
      return this.$store.getters.getMonths
    },
    userClaims() {
      return this.$store.getters.getUserClaims
    },
    className() {
      return this.userClaims
        ? Object.entries(this.userClaims).filter(role => role[1])[0][0]
        : ''
    },
  },
  methods: {
    reviewAttempt(item) {
      const id = item.id
      console.log(item)
      this.$router.push({
        name: 'quiz.exam',
        params: { id:'new', mode: 'practice', attempt: item, review: true },
      })
    },
    getLevel(item) {
      const level = item.level.index

      switch (level) {
        case 0:
          return {
            label: 'beginner',
            color: 'green',
          }
        case 1:
          return {
            label: 'intermediary',
            color: 'blue',
          }
        case 2:
          return {
            label: 'advanced',
            color: 'orange',
          }
        case 3:
          return {
            label: 'expert',
            color: 'red',
          }
      }
    },
    getItemIconColorApprove(item) {
      if (item.approve) {
          return 'green'
      } else {
        return 'red'
      }
      return item.type === 'random' ? '#2196F3' : '#6755FA'
    },
    getItemIconColor(item) {
      if (item.toDelete) {
        if (item.toDelete.status) {
          return '#ff0000'
        } else {
          return '#c4c4c4'
        }
      }
      return item.type === 'random' ? '#2196F3' : '#6755FA'
    },
    itemRowStyle(item) {
      return item.toDelete
        ? item.toDelete.status
          ? 'item-to-delete'
          : 'item-deleted'
        : 'item-active ' + this.className
    },
    formatDate(date) {
      const year = date.substr(0, 4)
      const month = date.substr(5, 2)
      const day = date.substr(8, 2)

      const today = new Date()
      const testDate = new Date(`${month}/${day}/${year}`)

      const diffDays = Math.floor(
        Math.abs(today - testDate) / (1000 * 60 * 60 * 24),
      )

      const testTime = date
        .split('T')[1]
        .split('.')[0]
        .substr(0, 5)

      if (diffDays === 0) {
        return `${this.$t('SHARED.DATE.today_at')} ${testTime}`
      } else if (diffDays === 1) {
        return `${this.$t('SHARED.DATE.yesterday_at')} ${testTime}`
      } else {
        return `${this.$t(
          'SHARED.DATE.MONTH.' + this.months[parseInt(month)],
        ).substr(0, 3)} ${day} ${year}`
      }
    },
    onRowClick(item) {
      if (this.userClaims['appraiser']) {
        return
      }

      analytics.logEvent('select_item', {
        item_list_name: item.title,
        item_list_id: item.id,
        items: [item],
      })

      this.$router.push('/quizzes/' + item.id)
    },
  },
  created() {
    if (this.userClaims && this.userClaims['student']) {
      this.$store.dispatch('loadLastTests', 10)
    } else {
      this.$store.dispatch('loadLastTests', 5)
    }
  },
}
</script>

<style scoped>
.icon-container {
  display: flex;
  justify-content: center;
  align-items: center;

  height: 30px;
  width: 30px;

  border-radius: 60px;
  margin-right: 5px;

  animation: animate-icon 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.tests-table {
  border-radius: 26px;
  overflow: hidden;
}

.table-title {
  color: #555;
  font-size: 1.2rem;
  font-weight: 500;
}

.title-divider {
  height: 1px;
  width: 100%;

  background-color: #6755fa44;
}

.type-container {
  display: flex;
  flex-direction: row;
  align-items: center;
}

@keyframes animate-icon {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}
</style>

<style>
.dashboard-tests-table .item-to-delete {
  color: #f00;
  background-color: white !important;
}

.dashboard-tests-table .item-deleted {
  color: #c4c4c4;
  background-color: white !important;
}

.dashboard-tests-table .item-active.admin,
.dashboard-tests-table .item-active.student {
  cursor: pointer !important;
}
</style>
