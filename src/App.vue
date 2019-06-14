<template>
  <v-app light>
    <v-content>
      <section>
        <v-parallax :src="require('./assets/rocket-league-banner.jpg')" height="500">
          <v-layout
                  column
                  align-center
                  justify-center
          >
            <h1 class="white--text px-3 py-1 mb-2 display-1 text-xs-center" style="background-color:rgba(0,0,0,0.5);">
              Sign the Petition and Keep Rocket League on Steam!
            </h1>
            <a href="#" style="width:250px">
              <v-img :src="require('./assets/steam-sign-in-button.png')"></v-img>
            </a>
          </v-layout>
        </v-parallax>
      </section>

      <section>
        <v-layout
                column
                wrap
                class="my-5"
                align-center
        >
          <v-flex xs12 sm4 class="my-3">
            <div class="text-xs-center">
              <h2 class="headline">{{ numPlayers }} players have signed!</h2>
            </div>
            <table-list></table-list>
          </v-flex>
        </v-layout>
      </section>

      <section>
        <v-parallax :src="require('./assets/rocket-league-banner-lg.jpg')" height="380">

        </v-parallax>
      </section>

    </v-content>

  </v-app>
</template>

<script>
import TableList from './components/TableList'

export default {
  name: 'App',
  components: {
    TableList
  },
  data () {
    return {
      numPlayers: 69
    }
  }
}
</script>
