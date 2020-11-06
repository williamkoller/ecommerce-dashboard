<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-form ref="form" v-model="formData">
        <el-col :span="17">
          <el-card class="box-card">
            <div slot="header">
              <span>Informações do Usuário</span>
              <el-button
                v-if="isEdit"
                type="primary"
                style="float:right;margin-top:-5px"
                @click="showSettingsDialog = true"
              >
                <svg-icon icon-class="reset-pass"/>
              </el-button>
            </div>
            <el-form-item label="Nome">
              <el-input v-model="formData.name" type="text"/>
            </el-form-item>
            <el-form-item label="Sobrenome">
              <el-input v-model="formData.surname" type="text"/>
            </el-form-item>
            <el-form-item label="E-mail">
              <el-input v-model="formData.email" type="text"/>
            </el-form-item>
            <el-form-item v-if="!isEdit" label="Senha">
              <el-input v-model="formData.password" type="password"/>
            </el-form-item>
          </el-card>
        </el-col>
        <el-col :span="7">
          <el-card class="box-card-component">
            <div slot="header" class="box-card-header" @click="showMediaGallery = true">
              <img
                :src="formData.image ? formData.image.url : '/static/sem-imagem.png'"
                :alt=" formData.image ? formData.image.original_name : 'Sem Imagem'"
                :title=" formData.image ? formData.image.original_name : 'Clique para escolher uma imagem'"
              >
            </div>
            <el-row style="margin-top:20px;">
              <el-button v-show="isEdit" type="danger" @click.prevent="showDeleteDialog = true">
                <i class="el-icon-delete"/>
              </el-button>
              <el-button type="primary" style="float:right" @click="handleSave">Salvar</el-button>
            </el-row>
          </el-card>
        </el-col>
      </el-form>
    </el-row>
    <!-- galeria de imagens -->
    <media-manager
      :visibility.sync="showMediaGallery"
      :image="formData.image"
      @selectImage="changeImage"
    />
    <!-- Confirmação de Deletar -->
    <el-dialog :visible.sync="showDeleteDialog" title="Confirmação" center>
      <span>
        Tem certeza que deseja deletar o Usuário:
        <b>{{ formData.name }}</b>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button type="danger" @click.prevent="showDeleteDialog = false">Cancelar</el-button>
        <el-button type="primary" @click.prevent="handleDestroy">Confirmar</el-button>
      </span>
    </el-dialog>
    <!-- Modal para Resetar a Senha -->
    <el-dialog :visible.sync="showSettingsDialog" title="Opções">
      <span>Deseja resetar a senha deste usuário?</span>
    </el-dialog>
  </div>
</template>
<script>
const defaultForm = {
  id: undefined,
  name: '',
  surname: '',
  email: '',
  image_id: undefined,
  password: ''
}
import { mapGetters } from 'vuex'
import MediaManager from '@/components/MediaManager'

export default {
  name: 'UserEditor',

  components: { MediaManager },

  data() {
    return {
      loading: false,
      tempRoute: '',
      isEdit: false,
      formData: Object.assign({}, defaultForm),
      showMediaGallery: false,
      showDeleteDialog: false,
      showSettingsDialog: false
    }
  },

  computed: {
    ...mapGetters({
      user: 'currentUser'
    })
  },

  created() {
    // Salva o nome da rota para evitar bugs nas abas de navegação
    this.tempRoute = Object.assign({}, this.$route)

    this.$route.params && this.$route.params.id
      ? (this.isEdit = true)
      : (this.isEdit = false)
  },

  mounted() {
    if (this.isEdit) {
      this.findUser(this.$route.params.id)
    }
  },

  methods: {
    findUser(id) {
      this.loading = true
      this.$store.dispatch('findUser', id).then(() => {
        this.loading = false
        this.fillForm()
      })
    },

    fillForm() {
      this.formData = Object.assign({}, this.user)
      this.updateNavigationTab()
    },

    handleSave() {
      this.loading = true
      this.$store
        .dispatch('saveUser', this.prepareToSave(this.formData))
        .then(() => {
          this.loading = false
          this.$message({
            message: 'Salvo com sucesso!',
            type: 'success',
            showClose: true,
            duration: 1000
          })

          this.fillForm()

          if (!this.isEdit) {
            this.deleteNavigationtab()
            this.$router.push({
              name: 'EditUser',
              params: { id: this.formData.id }
            })
          }
          this.updateNavigationTab()
        })
    },

    handleDestroy() {
      this.showDeleteDialog = false
      this.$store.dispatch('destroyUser', this.formData.id).then(() => {
        this.$message({
          message: 'Usuário Deletado!',
          type: 'warning',
          showClose: true,
          duration: 1000
        })

        this.deleteNavigationtab()
        this.$router.go(-1)
      })
    },

    changeImage(image) {
      this.formData.image_id = image.id
      this.formData.image = image
    },

    /**
     * Formata os dados que serão enviados para o servidor
     */
    prepareToSave(data) {
      return {
        id: data.id,
        name: data.name,
        surname: data.surname,
        email: data.email,
        image_id: data.image_id,
        password: data.password ? data.password : undefined
      }
    },

    /**
     * Métodos para gerenciar as abas de navegação no topo da pagina
     */
    updateNavigationTab() {
      const route = Object.assign({}, this.tempRoute, {
        title: `${this.formData.name}`
      })
      this.$store.dispatch('updateVisitedView', route)
    },

    deleteNavigationtab() {
      // deleta a tag de paginas visitadas
      const route = Object.assign({}, this.tempRoute, {
        title: `${this.formData.name}`
      })

      this.$store.dispatch('delVisitedView', route)
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss">
.box-card-component {
  .el-card__header {
    padding: 0px !important;
  }
}

.box-card-component {
  .box-card-header {
    position: relative;
    height: 270px;
    img {
      width: 100%;
      height: 100%;
      transition: all 0.2s linear;
      &:hover {
        transform: scale(1.1, 1.1);
        filter: contrast(130%);
      }
      cursor: pointer;
    }
  }
}
</style>
