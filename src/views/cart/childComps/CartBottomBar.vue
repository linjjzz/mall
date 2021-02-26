<template>
  <div class="botton-bar">
    <div class="check-content">
      <check-button @click.native="checkClick" :disabled="isDisable" :is-checked="isSelectAll" class="check-button"/>
      <span>全选</span>
    </div>
    <div class="price">
      合计:{{totalPrice}}
    </div>
    <div class="calculate">
      去计算({{checkLength}})
    </div>
  </div>
</template>

<script>
  import CheckButton from 'components/content/checkButton/CheckButton'

  export default {
    name: 'CartBottomBar',
    components: { CheckButton },
    data() {
      return{
        isDisable: true
      }
    },
    computed: {
      totalPrice() {
        return '￥' + this.$store.state.cartList.filter(item => {
          return item.checked
        }).reduce((preValue, item) => {
          return preValue + item.price * item.count
        },0).toFixed(2)
      },
      checkLength() {
        return this.$store.state.cartList.filter(item => item.checked).length
      },
      isSelectAll() {
        // return !(this.$store.state.cartList.filter(item => !item.checked).length)
        if(this.$store.state.cartList.length === 0){
          return false
        }else{
        return !this.$store.state.cartList.find(item => !item.checked)
        }
      }
    },
    methods: {
      checkClick() {
        if(this.$store.state.cartList.length === 0){
          this.isDisable = false
        }else{
          if(this.isSelectAll) {
            this.$store.state.cartList.forEach(item => item.checked = false)
          }else {
            this.$store.state.cartList.forEach(item => item.checked = true)
          }
        }
      }
    }
  }
</script>

<style scoped>
  .botton-bar {
    height: 40px;
    background-color: #eee;
    position: relative;
    line-height: 40px;
    display: flex;
    font-size: 14px;
  }

  .check-content {
    display: flex;
    align-items: center;
    margin-left: 10px;
    width: 60px;
  }

  .check-button {
    width: 20px;
    height: 20px;
    line-height: 20px;
    margin-right: 5px;
  }

  .price {
    margin-left: 20px;
    flex: 1;
  }

  .calculate {
    width: 90px;
    background-color: var(--color-tint);
    color: #fff;
    text-align: center;
  }
</style>