<template>
  <span>{{ tweeningValue }}</span>
</template>

<script>
import TWEEN from 'tween.js'

export default {
  props: {
    value: {
      type: Number,
      required: true
    }
  },
  data () {
    return {
      tweeningValue: 0
    }
  },
  watch: {
    value (newValue, oldValue) {
      this.tween(oldValue, newValue)
    }
  },
  mounted () {
    this.tween(0, this.value)
  },
  methods: {
    tween (startValue, endValue) {
      const vm = this
      function animate () {
        if (TWEEN.update()) {
          requestAnimationFrame(animate)
        }
      }
      new TWEEN.Tween({ tweeningValue: startValue })
        .to({ tweeningValue: endValue * 10 }, 1000)
        .onUpdate(function () {
          vm.tweeningValue = this.tweeningValue.toFixed(0)
        })
        .start()
      animate()
    }
  }
}
</script>
