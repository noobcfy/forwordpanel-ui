<template>
  <div class="app-container">
    <div class="searchBody">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline" @submit.native.prevent>
        <el-form-item>
          <el-button type="success"  icon="el-icon-plus" @click="showAddDialog" >添加服务器</el-button>
          <el-button type="primary"    @click="showPortListDialog()" >端口管理</el-button>
          <el-button   @click="refreshServerList" >刷新</el-button>
        </el-form-item>
      </el-form>
      <span style="font-size: 12px; color: #606266"><i class="el-icon-warning" style="margin-right: 3px"></i>添加服务器后, 选中服务器点 端口管理 按钮维护端口</span>
    </div>
    <el-table
      :data="tableData"
      style="width: 100%; margin-bottom: 20px;"
      row-key="id"
      ref="singleTable"
      @current-change="handleSelect"
      highlight-current-row
      border
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
      <el-table-column label="行号" type="index" width="50"></el-table-column>
      <el-table-column label="服务器名称" prop="serverName" ></el-table-column>
      <el-table-column label="地址" prop="host" ></el-table-column>
      <el-table-column label="端口" prop="port" ></el-table-column>
      <el-table-column label="用户名" prop="username" ></el-table-column>
      <el-table-column label="密码"   prop="password" ></el-table-column>
      <el-table-column label="状态"   prop="state" >
        <template slot-scope="scope">
                                <span :class="computeClass(scope.row.state)" v-if="scope.row.state === item.state" v-for="(item,index) in stateList" :key="item+index">
                                    {{item.stateName}}
                                </span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="160">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改时间" width="160">
        <template slot-scope="scope">
          <span>{{ scope.row.updateTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width='160'>
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="showEditDialog(scope.row)" title="编辑">编辑</el-button>
          <el-button type="danger" size="mini" @click="deleteData(scope.row)" title="删除">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="block">
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :page-sizes="[10, 20, 50]"
        :page-size="searchForm.pageSize"
        :current-page="searchForm.pageNum"
        layout="total, sizes, prev, pager, next, jumper"
        :total="dataTotal">
      </el-pagination>
    </div>
    <el-drawer
      title="端口管理"
      :with-header="false"
      :visible.sync="portListDialog"
      direction="rtl"
      size="60%">
      <div class="drawer-body">
        <el-button size="mini" type="success" icon="el-icon-plus" @click="showAddPortDialog" >添加端口</el-button>
        <el-button size="mini"   @click="refreshPortList" >刷新</el-button>
        <div style="font-size: 12px; color: #606266; margin: 10px 0 5px 0"><i class="el-icon-warning" style="margin-right: 3px"></i>端口为异步添加, 请点击刷新查询端口是否添加完成</div>
        <el-table :data="portList">
          <el-table-column property="localPort" label="本地端口" ></el-table-column>
          <el-table-column property="internetPort" label="外网端口" ></el-table-column>
          <el-table-column label="创建时间" width="160">
            <template slot-scope="scope">
              <span>{{ scope.row.createTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
            </template>
          </el-table-column>
          <el-table-column label="修改时间" width="160">
            <template slot-scope="scope">
              <span>{{ scope.row.updateTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" width='250'>
            <template slot-scope="scope">
              <el-button type="primary" size="mini" @click="showEditPortDialog(scope.row)" title="编辑">编辑</el-button>
              <el-button type="danger" size="mini" @click="deletePort(scope.row)" title="删除">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="block">
          <el-pagination
            background
            @size-change="handlePortSizeChange"
            @current-change="handlePortCurrentChange"
            :page-sizes="[10, 20, 50]"
            :page-size="portSearchForm.pageSize"
            :current-page="portSearchForm.pageNum"
            layout="total, sizes, prev, pager, next, jumper"
            :total="portDataTotal">
          </el-pagination>
        </div>
      </div>
    </el-drawer>
    <el-dialog title="添加服务器" :visible.sync="addDialog" width="30%">
      <el-form :model="addForm" :rules="addFormRules" ref="addForm" label-width="80px" size="small">
        <el-form-item label="名称" prop="serverName">
          <el-input size="mini"  v-model="addForm.serverName" ></el-input>
        </el-form-item>
        <el-form-item label="地址" prop="host">
          <el-input size="mini"  v-model="addForm.host" ></el-input>
        </el-form-item>
        <el-form-item
          label="端口"
          prop="port"
          :rules="[
            { required: true, message: '端口不能为空'},
            { type: 'number', message: '端口必须为数字值'}
          ]">
          <el-input size="mini"  v-model.number="addForm.port" ></el-input>
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input size="mini" v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input size="mini" v-model="addForm.password"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialog = false">取 消</el-button>
        <el-button type="primary" @click="confirmAddForm">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="添加端口" :visible.sync="addPortDialog" width="30%">
      <el-form :model="addPortForm" :rules="addPortFormRules" ref="addPortForm" label-width="120px" size="small">
        <el-form-item
          label="本地端口"
          prop="localPort"
          :rules="[
            { required: true, message: '端口不能为空'}
          ]"
        >
          <el-input size="mini" placeholder="单端口如:80,多端口80-83"  v-model="addPortForm.localPort" ></el-input>
        </el-form-item>
        <el-form-item
          label="外网端口"
          prop="internetPort"
        >
          <el-input size="mini" placeholder="不填默认和本地端口相同" v-model="addPortForm.internetPort" ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addPortDialog = false">取 消</el-button>
        <el-button type="primary" @click="confirmAddPort">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="修改端口" :visible.sync="editPortDialog" width="30%">
      <el-form :model="editPortForm" :rules="addPortFormRules" ref="editPortForm" label-width="120px" size="small">
        <el-form-item
          label="本地端口"
          prop="localPort"
          :rules="[
            { required: true, message: '端口不能为空'},
            { type: 'number', message: '端口必须为数字值'}
          ]"
        >
          <el-input size="mini"  v-model.number="editPortForm.localPort" ></el-input>
        </el-form-item>
        <el-form-item
          label="外网端口"
          prop="internetPort"
          :rules="[
            { required: true, message: '端口不能为空'},
            { type: 'number', message: '端口必须为数字值'}
          ]"
        >
          <el-input size="mini"  v-model.number="editPortForm.internetPort" ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editPortDialog = false">取 消</el-button>
        <el-button type="primary" @click="confirmEditPort">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getPage, save, deleteData } from '@/api/server'
import { getPortList, deletePort, batchSavePort, savePort } from '@/api/port'
export default {
  computed: {
  },
  data() {
    return {
      tableData: [],
      dataTotal: null,
      portDataTotal: null,
      searchForm: {
        pageSize: 10,
        pageNum: 1
      },
      portSearchForm: {
        pageSize: 10,
        pageNum: 1,
        serverId: null
      },
      addForm: {
        id: null,
        serverName: null,
        addType: 'add',
        password: null
      },
      addPortForm: {
        id: null,
        username: null,
        password: null
      },
      addFormRules: {
        serverName: [{ required: true, trigger: 'blur', message: '必需项' }],
        host: [{ required: true, trigger: 'blur', message: '必需项' }],
        username: [{ required: true, trigger: 'blur', message: '必需项' }]
      },
      addPortFormRules: {
      },
      addDialog: false,
      selectedRow: null,
      portList: [],
      portListDialog: false,
      addPortDialog: false,
      editPortDialog: false,
      editPortForm: {},
      stateList: [
        {
          'state': 1,
          'stateName': '初始化中'
        },
        {
          'state': 2,
          'stateName': '连接失败'
        },
        {
          'state': 3,
          'stateName': '在线'
        }
      ]
    }
  },
  mounted() {
    this.getData()
  },
  methods: {
    computeClass(state) {
      if (state) {
        if (state === 1) {
          return 'state-normal'
        } else if (state === 2) {
          return 'state-fail'
        } else if (state === 3) {
          return 'state-online'
        }
      }
      return 'state-normal'
    },
    getData() {
      getPage(this.searchForm).then(response => {
        this.tableData = response.data.list
        this.dataTotal = response.data.total
      })
    },
    refreshServerList() {
      getPage(this.searchForm).then(response => {
        this.$notify({
          message: '刷新成功',
          type: 'success'
        })
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
          if (this.addForm.addType === 'add' && !this.addForm.password){
            this.$notify({
              message: '密码不能为空',
              type: 'warning'
            })
            return
          }
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
    handlePortSizeChange(pageSize) {
      this.portSearchForm.pageSize = pageSize
      getPortList(this.portSearchForm).then(response => {
        this.portList = response.data.list
        this.portDataTotal = response.data.total
      })
    },
    handlePortCurrentChange(pageNum) {
      this.portSearchForm.pageNum = pageNum
      getPortList(this.portSearchForm).then(response => {
        this.portList = response.data.list
        this.portDataTotal = response.data.total
      })
    },
    refreshPortList() {
      getPortList(this.portSearchForm).then(response => {
        this.portList = response.data.list
        this.portDataTotal = response.data.total
      })
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
    showPortListDialog() {
      if (!this.selectedRow) {
        this.$notify({
          message: '请选择服务器',
          type: 'warning'
        })
        return
      }
      this.portListDialog = true
      this.portSearchForm.serverId = this.selectedRow.id
      getPortList(this.portSearchForm).then(response => {
        this.portList = response.data.list
        this.portDataTotal = response.data.total
      })
    },
    handleSelect(val) {
      this.selectedRow = val
    },
    deletePort(row) {
      this.$confirm('确认删除?', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deletePort({ id: row.id }).then(response => {
          this.$notify({
            message: '删除成功',
            type: 'success'
          })
          getPortList(this.portSearchForm).then(response => {
            this.portList = response.data.list
            this.portDataTotal = response.data.total
          })
        })
      })
    },
    showAddPortDialog() {
      this.addPortDialog = true
    },
    confirmAddPort() {
      this.$refs['addPortForm'].validate((valid) => {
        if (valid) {
          this.addPortForm.serverId = this.selectedRow.id
          batchSavePort(this.addPortForm).then(response => {
            this.$notify({
              message: '请求添加成功,请点击刷新按钮查看添加进度',
              type: 'success'
            })
            this.addPortDialog = false
            getPortList(this.portSearchForm).then(response => {
              this.portList = response.data.list
              this.portDataTotal = response.data.total
            })
          })
        }
      })
    },
    showEditPortDialog(row) {
      this.editPortDialog = true
      this.editPortForm = row
    },
    confirmEditPort() {
      this.$refs['editPortForm'].validate((valid) => {
        if (valid) {
          savePort(this.editPortForm).then(response => {
            this.$notify({
              message: '保存成功',
              type: 'success'
            })
            this.editPortDialog = false
            getPortList(this.portSearchForm).then(response => {
              this.portList = response.data.list
              this.portDataTotal = response.data.total
            })
          })
        }
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
.state-normal {
}
.state-fail {
  color: #F56C6C;
}
.state-online {
  color: #67C23A;
}
</style>
