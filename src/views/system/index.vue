<template>
  <div class="app-container">
    <el-form ref="form" :model="addForm" style="width: 400px" label-width="80px">
      <el-form-item label="系统升级">
        <el-button @click="exportSystemData" size="mini">导出数据</el-button>
        <el-button type="primary" @click="importSystemData" size="mini">导入数据</el-button>
      </el-form-item>
      <el-form-item label="TG:" prop="telegram">
        <el-input size="mini" placeholder="请输入tg链接,租户到期会弹框提示" v-model="addForm.telegram" ></el-input>
      </el-form-item>
      <el-form-item label="QQ:" prop="qq">
        <el-input size="mini" placeholder="请输入qq号,租户到期会弹框提示" v-model="addForm.qq" ></el-input>
      </el-form-item>
      <el-form-item label="邮箱:" prop="email">
        <el-input size="mini" placeholder="请输入邮箱地址,租户到期会弹框提示" v-model="addForm.email" ></el-input>
      </el-form-item>
      <el-button size="mini" style="float:right" type="primary" @click="saveSysConfig">保存配置</el-button>
    </el-form>
    <el-dialog title="导入数据" :visible.sync="importDialog" width="30%">
      <el-form :model="addForm"  ref="addForm" label-width="80px" size="small">
        <el-form-item label="文件"  prop="addForm">
          <el-upload
            class="upload-demo"
            accept=".json"
            ref="upload"
            action="/system/importData"
            :http-request = "customUpload"
            :auto-upload="false"
            :show-file-list="true"
            :file-list="addForm.fileList">
            <el-button size="small" type="primary">选择文件</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="importDialog = false">取 消</el-button>
        <el-button type="primary" @click="confirmImport">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { exportData, importData, saveConfig, getConfig } from '@/api/system'
export default {
  data() {
    return {
      tableData: [],
      dataTotal: null,
      addForm: {
        id: null,
        telegram: null,
        qq: null,
        email: null
      },
      importDialog: false
    }
  },
  mounted() {
    this.getSysConfig()
  },
  methods: {
    saveSysConfig() {
      saveConfig(this.addForm).then(response => {
        this.$notify({
          message: '保存成功',
          type: 'success'
        })
        this.getSysConfig()
      })
    },
    getSysConfig() {
      getConfig({}).then(response => {
        this.addForm = response.data
      })
    },
    exportSystemData() {
      // 权限管理
      exportData({
      }).then(res => {
        if (res.code === '0') {
          this.fileConversion(`system-export-${new Date().getTime()}.json`, JSON.stringify(res.data))
        } else {
          this.$notify({
            message: res.msg,
            type: 'error'
          })
        }
      }).catch(err => {
        this.$notify({
          message: err.message,
          type: 'error'
        })
      })
    },
    importSystemData() {
      this.importDialog = true
    },
    customUpload(file) {
      importData(file).then(response => {
        this.importDialog = false
        this.$notify({
          message: '导入完成',
          type: 'success'
        })
      })
    },
    confirmImport() {
      this.$refs.upload.submit()
    },
    /**
     * 字节流转换成文件下载
     * inputFileName：文件名
     * data：后台取得数据
     */
    fileConversion(inputFileName, data) {
      // 文件名
      const fileName = inputFileName
      const blob = new Blob([data], {
        type:
          'application/text'
      })
      if (window.navigator.msSaveOrOpenBlob) {
        navigator.msSaveBlob(blob)
      } else {
        const elink = document.createElement('a')
        elink.download = fileName
        elink.style.display = 'none'
        elink.href = URL.createObjectURL(blob)
        document.body.appendChild(elink)
        elink.click()
        document.body.removeChild(elink)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
