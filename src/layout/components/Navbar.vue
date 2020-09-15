<template>
  <div class="navbar">
    <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb class="breadcrumb-container" />

    <div class="right-menu">
      <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          <img src="avatar.gif?imageView2/1/w/80/h/80'" class="user-avatar">
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <router-link to="/">
            <el-dropdown-item>
              首页
            </el-dropdown-item>
          </router-link>
          <el-dropdown-item divided @click.native="showResetPwdDialog">
            <span style="display:block;">修改密码</span>
          </el-dropdown-item>
          <el-dropdown-item divided @click.native="logout">
            <span style="display:block;">登出</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <el-dialog title="修改密码" :visible.sync="resetPwdDialog" width="30%">
      <el-form :model="addForm" :rules="resetPwdFormRules" ref="addForm" label-width="120px" size="small">
        <el-form-item label="新密码" prop="pwd">
          <el-input type="password" size="mini"  v-model="addForm.pwd" ></el-input>
        </el-form-item>
        <el-form-item label="确认新密码" prop="isPwd">
          <el-input type="password" size="mini"  v-model="addForm.isPwd" ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetPwdDialog = false">取 消</el-button>
        <el-button type="primary" @click="confirmReset(row)">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import { resetPwd } from '@/api/user'

export default {
  data() {
    const validateRepeatPassword = (rule, value, callback) => {
      if (this.addForm.pwd !== this.addForm.isPwd) {
        callback(new Error('密码不一致'))
      } else {
        callback()
      }
    }
    return {
      resetPwdDialog: false,
      resetPwdFormRules: {
        pwd: [{ required: true, min: 4, trigger: 'blur', message: '密码最少4位' }],
        isPwd: [{ required: true, min: 4, trigger: 'blur',validator: validateRepeatPassword }]
      },
      addForm: {
        pwd: null,
        isPwd: null
      }
    }
  },
  components: {
    Breadcrumb,
    Hamburger
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar'
    ])
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    },
    showResetPwdDialog() {
      this.resetPwdDialog = true
    },
    confirmReset() {
      this.$refs.addForm.validate(valid => {
        if (valid) {
          resetPwd(this.addForm).then(response => {
            this.$notify({
              message: '密码修改成功',
              type: 'success'
            })
            this.resetPwdDialog = false
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
