<template>
  <div id="detail">
    <detail-nav-bar class="detail-nav" ref="nav" @titleClick="titleClick"/>
    <scroll class="content" ref="scroll" :probe-type="3" @scroll="contentScroll">
      
      <detail-swiper :top-images="topImages"/>
      <detail-base-info :goods="goods"/>
      <detail-shop-info :shop="shop"/>
      <detail-goods-info :detail-info="detailInfo" @imageLoad="imageLoad"/>
      <detail-param-info ref="params" :param-info="paramInfo"/>
      <detail-comment-info ref="comment" :comment-info="commentInfo"/>
      <goods-list ref="recommend" :goods="recommends"/>
    </scroll>
    <detail-bottom-bar @addCart="addToCart"/>

    <back-top @click.native="backClick" v-show="isShowBackTop"/>
    <toast :message="message" :show="show"/>
  </div>
</template>

<script>
  import {getDetail, Goods, Shop, GoodsParam, getRecommend} from 'network/detail'
  import {itemImgListenerMixin, backTopMixin} from 'common/mixin'
  import {debounce} from 'common/utils'

  import Scroll from 'components/common/scroll/Scroll'
  import GoodsList from 'components/content/goods/GoodsList'
  import Toast from 'components/common/toast/Toast'


  import DetailNavBar from './childComps/DetailNavBar';
  import DetailSwiper from './childComps/DetailSwiper';
  import DetailBaseInfo from './childComps/DetailBaseInfo';
  import DetailShopInfo from './childComps/DetailShopInfo';
  import DetailGoodsInfo from './childComps/DetailGoodsInfo';
  import DetailParamInfo from './childComps/DetailParamInfo';
  import DetailCommentInfo from './childComps/DetailCommentInfo';
  import DetailBottomBar from './childComps/DetailBottomBar'; 


  export default {
    components: { DetailNavBar, DetailSwiper,DetailBaseInfo, DetailShopInfo, Scroll, DetailGoodsInfo, DetailParamInfo, DetailCommentInfo, GoodsList, DetailBottomBar, Toast },
    name: 'Detail',
    mixins:[itemImgListenerMixin, backTopMixin],
    data() {
      return {
        iid: null,
        topImages: [],
        goods: {},
        shop: {},
        detailInfo: {},
        paramInfo: {},
        commentInfo: {},
        recommends: [],
        themeTopYs: [],
        getThemeTopY: null,
        currentIndex: null,
        message: '',
        show: false
      }
    },
    created() {
      //1.保存传入的iid
      this.iid = this.$route.params.iid
      //2.根据iid请求详情数据
      getDetail(this.iid).then(res => {
        const data = res.result;
        //获取顶部图片的轮播数据
        this.topImages = data.itemInfo.topImages

        //获取商品信息
        this.goods = new Goods(data.itemInfo, data.columns, data.shopInfo.services)

        //创建店铺信息
        this.shop = new Shop(data.shopInfo)

        //保存商品的详情数据
        this.detailInfo = data.detailInfo

        //获取参数的信息
        this.paramInfo = new GoodsParam(data.itemParams.info, data.itemParams.rule)

        //获取评论信息
        if(data.rate.cRate !== 0){
          this.commentInfo = data.rate.list[0] 
        }

        //dom加载完毕了 但是图片没有加载完毕
        // this.$nextTick(() => {
        //   // this.themTopYs = []
        //   this.themTopYs.push(0)
        //   this.themTopYs.push(this.$refs.params.$el.offsetTop)
        //   this.themTopYs.push(this.$refs.comment.$el.offsetTop)
        //   this.themTopYs.push(this.$refs.recommend.$el.offsetTop)
        //   console.log(this.themTopYs);
        // })
      })
      
      //请求推荐数据
      getRecommend().then(res => {
        this.recommends = res.data.list
      })

      //给getThemeTopY
      this.getThemeTopY = debounce(() => {
        this.themeTopYs = []
        this.themeTopYs.push(0)
        this.themeTopYs.push(this.$refs.params.$el.offsetTop)
        this.themeTopYs.push(this.$refs.comment.$el.offsetTop)
        this.themeTopYs.push(this.$refs.recommend.$el.offsetTop)
        // console.log(this.themeTopYs);
      }, 100)
    },
    mounted() {
      
    },
    destroyed() {
      this.$bus.$off('itemImageLoad', this.itemImgListener)
    },
    methods: {
      imageLoad() {
        this.refresh()
        this.getThemeTopY()
      },
      titleClick(index) {
        // console.log(index);
        this.$refs.scroll.scrollTo(0, -this.themeTopYs[index], 200)
      },
      contentScroll(position) {
        //获取y值
        const positiopnY = -position.y
        
        //positiopnY和主题中的值进行对比
        let length = this.themeTopYs.length
        for(let i = 0; i < length; i++) {
          if(this.currentIndex !== i && ((i < length - 1 && positiopnY >= this.themeTopYs[i] && positiopnY < this.themeTopYs[i+1]) || 
            (i === length - 1 && positiopnY >= this.themeTopYs[i]))){
              this.currentIndex = i
              // console.log(this.currentIndex);
              this.$refs.nav.currentIndex = this.currentIndex
            } 
        }
      },
      contentScroll(prosition) {
        //判断backtop是否显示
        this.isShowBackTop = -prosition.y > 1000 
      },
      addToCart() {
        //获取购物车需要展示的商品
        const product = {}
        product.image = this.topImages[0]
        product.title = this.goods.title
        product.desc = this.goods.desc
        product.price = this.goods.realPrice 
        product.iid = this.iid

        // console.log(product);

        //将商品添加到购物车里
        // this.$store.commit('addCart', product)
        this.$store.dispatch('addCart', product).then(res =>{
          this.show = true
          this.message = res
          
          setTimeout(() => {
            this.show = false
            this.message = ''
          },1500)
        })
      }
    }
  }
</script>

<style scoped>
  #detail {
    position: relative;
    z-index: 999;
    background-color: #fff;
    height: 100vh;
  }

  .detail-nav {
    position: relative;
    z-index: 9;
    background-color: #fff;
  }

  .content {
    height: calc(100% - 44px - 58px);
  }
</style>