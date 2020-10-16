<template>
  <section>
    <div v-if="isMobile" class="footer-page">
      <el-button type="success" :disabled="currentPage <= 1" @click="pre()">上一页</el-button>
      <el-button type="success" @click="backTop()">返回首页</el-button>
      <el-button type="success" :disabled="currentPage >= Math.ceil(total / pageSize)" @click="next()">下一页</el-button>
    </div>
    <el-pagination
      v-else
      background
      :attr="$attrs"
      v-on="$listeners"
      class="footer-pc-page"
      layout="total, sizes, prev, pager, next, jumper"
      >
    </el-pagination>
  </section>
</template>

<script>
export default {
  name: 'pager',
  data () {
    return {
      isMobile: false
    }
  },
  props: {
    currentPage: {
      type: Number,
      default () { return 1 }
    },
    total: {
      type: Number,
      default () { return 0 }
    },
    pageSize: {
      type: Number,
      default () { return 10 }
    },
    fatherId: {
      type: String,
      default () { return null }
    }
  },
  methods: {
    pre (){
      if (this.currentPage <= 1) return
      this.$emit('current-change', this.currentPage - 1)
      this.scrollTop()
    },
    next (){
      if (this.currentPage >= Math.ceil(this.total / this.pageSize) ) return
      this.$emit('current-change', this.currentPage + 1)
      this.scrollTop()
    },
    backTop () {
      this.$emit('current-change', 1)
      this.scrollTop()
    },
    scrollTop () {
      let currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
      (function scroll(){
        let currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
        if (currentScroll > 0) {
          window.requestAnimationFrame(scroll);
          window.scrollTo (0,currentScroll - (currentScroll / 5));
        }
      })();
    }
  },
  components: {
  },
  mounted () {
    if (document.body.clientWidth < 600) {
      this.isMobile = true
    }
  }
}
</script>

<style scoped lang="scss">
  .footer-page{
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: #fff;
    padding: 5px 5px;
    display: flex;
    justify-content: space-around;
  }
  .footer-pc-page{
    position: absolute;
    bottom: 0;
    left: 50%;
    width: auto;
    transform: translate(-50%,0);
    background-color: #fff;
    padding: 5px 5px;
    float:  right;
  }
</style>
