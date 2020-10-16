<template>
  <div class="app-container">
    <div class="searchBody">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline" @submit.native.prevent>
        <el-form-item>
          <el-button size="mini" type="success" icon="el-icon-plus" @click="showAddDialog" >添加配置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="item-container">
      <div class="item-box" v-for="(item,index) in tableData" :key="index">
        <div class="box-col"><label>配置名称</label>{{item.configName}}</div>
        <div class="box-col"><label>更新时间</label>{{item.updateTime || item.createTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}')}}</div>
        <div class="box-trl">
          <el-button type="primary" size="mini"  @click="showEditDialog(item)" title="编辑">编辑文本</el-button>
          <el-button type="primary" size="mini"  @click="showNodeListDialog(item)" title="编辑">节点管理</el-button>
          <el-button type="success" size="mini"  @click='copyLink(item,$event)' title="复制链接">复制链接</el-button>
          <el-button type="danger" size="mini"  @click="deleteData(item)" title="删除">删除</el-button>
        </div>
      </div>
    </div>
    <xd-pager
      background
      fixed
      v-if="dataTotal/searchForm.pageSize > 1"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :page-sizes="[10, 20, 50]"
      :page-size="searchForm.pageSize"
      :current-page="searchForm.pageNum"
      layout="total, sizes, prev, pager, next, jumper"
      :total="dataTotal">
    </xd-pager>
    <el-dialog title="添加配置" :visible.sync="addDialog" width="50%">
      <el-form :model="addForm" :rules="addFormRules" ref="addForm" label-width="80px" size="small">
        <el-form-item label="配置名称" prop="configName">
          <el-input size="mini"  v-model="addForm.configName" ></el-input>
        </el-form-item>
        <el-form-item label="配置内容" prop="text">
          <el-input type="textarea" rows="15" size="mini"  v-model="addForm.text" ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialog = false">取 消</el-button>
        <el-button type="primary" @click="confirmAddForm">确 定</el-button>
      </div>
    </el-dialog>
    <el-drawer
      title="节点管理"
      :with-header="false"
      :visible.sync="nodeManageDialog"
      direction="rtl"
      :size="drawerPercent">
      <div class="drawer-body">
        <el-button size="mini" type="success" icon="el-icon-plus" @click="addNode" >添加节点</el-button>
        <el-button size="mini" type="success" icon="el-icon-save" @click="saveNode" >保存</el-button>
        <div class="item-container">
          <div class="item-box" v-for="(item,index) in nodeListData" :key="index">
            <div class="box-col"><label style="min-width: 50px;">名称</label><input v-model="item.name" class="box-input" type="text"></div>
            <div class="box-col"><label style="min-width: 50px;">地址</label><input v-model="item.server" class="box-input" type="text"></div>
            <div class="box-col"><label style="min-width: 50px;">端口</label><input v-model="item.port" class="box-input" type="text"></div>
            <div class="box-col"><label style="min-width: 50px;">类型</label><input v-model="item.type" class="box-input" type="text"></div>
            <div class="box-col"><label style="min-width: 50px;">密码</label><input v-model="item.password" class="box-input" type="text"></div>
            <div class="box-col"><label style="min-width: 50px;">sni</label><input v-model="item.sni" class="box-input" type="text"></div>
            <div class="box-trl">
              <el-button type="danger" size="mini"  @click="deleteRow(item)" title="删除">删除</el-button>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { getPage, save, deleteData, getNodeList, saveNodeList } from '@/api/config'
import clip from '@/utils/clipboard'
import EditableCell from "@/components/EditableCell/index.vue";
export default {
  components: {
    EditableCell
  },
  data() {
    return {
      tableData: [],
      dataTotal: null,
      nodeManageDialog: false,
      searchForm: {
        pageSize: 10,
        pageNum: 1
      },
      userTypeList: [
        {
          name: '管理员',
          value: 0
        },
        {
          name: '普通用户',
          value: 1
        }
      ],
      addForm: {
        id: null,
        username: null,
        addType: 'add',
        password: null
      },
      addFormRules: {
        host: [{ required: true, trigger: 'blur', message: '必需项' }],
        username: [{ required: true, trigger: 'blur', message: '必需项' }]
      },
      addDialog: false,
      nodeListData: [],
      editNodeConfigId: null
    }
  },
  mounted() {
    this.getData()
  },
  methods: {
    getData() {
      getPage(this.searchForm).then(response => {
        this.tableData = response.data.list
        this.dataTotal = response.data.total
      })
    },
    deleteData(row) {
      this.$confirm('确认删除?', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteData({ id: row.id }).then(response => {
          this.$notify({
            message: '删除成功',
            type: 'success'
          })
          this.getData()
        })
      })
    },
    confirmAddForm() {
      this.$refs['addForm'].validate((valid) => {
        if (valid) {
          save(this.addForm).then(response => {
            this.$notify({
              message: '保存成功',
              type: 'success'
            })
            this.addDialog = false
            this.getData()
          })
        }
      })
    },
    handleSizeChange(pageSize) {
      this.searchForm.pageSize = pageSize
      this.getData()
    },
    handleCurrentChange(pageNum) {
      this.searchForm.pageNum = pageNum
      this.getData()
    },
    showAddDialog() {
      this.addDialog = true
      this.addForm.addType = 'add'
      this.addForm.id = null
    },
    showEditDialog(row) {
      this.addDialog = true
      this.addForm = row
      this.addForm.password = null
      this.addForm.addType = 'edit'
    },
    showNodeListDialog(row) {
      this.editNodeConfigId = row.id
      getNodeList({ 'id': row.id }).then(response => {
        const nodeList = response.data.map(row => {
          return {
            ...row,
            editMode: false
          }
        })
        this.nodeListData = nodeList
      })
      this.nodeManageDialog = true
    },
    copyLink(row, event) {
      const curUrl = window.location.href
      let prefix = ''
      if (curUrl.indexOf('https') >= 0) {
        prefix = 'https://'
      } else {
        prefix = 'http://'
      }
      const link = prefix + window.location.host + '/config/' + row.id
      clip(link, event)
    },
    setEditMode(row, index) {
      row.editMode = true
    },
    saveRow(row, index) {
      row.editMode = false
    },
    addNode() {
      this.nodeListData.push({"name":"节点名称","server":"节点地址","port":443,"type":"trojan","password":"密码","sni":"节点真实地址"})
    },
    deleteRow(row) {
      const index = this.nodeListData.indexOf(row)
      if (index > -1) {
        this.nodeListData.splice(index, 1)
      }
    },
    saveNode() {
      saveNodeList(this.nodeListData, { 'id': this.editNodeConfigId }).then(response => {
        this.$notify({
          message: '保存成功',
          type: 'success'
        })
        this.getData()
        this.nodeManageDialog = false
      })
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
.drawer-body {
  padding: 20px;
}
.demo-drawer__footer {
  padding-top: 20px;
}
.edit-cell {
  min-height: 35px;
  cursor: pointer;
}
</style>
