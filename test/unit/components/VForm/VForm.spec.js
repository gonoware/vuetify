
import Vue from 'vue'
import { test } from '@/test'
import VTextField from '@/components/VTextField'
import VBtn from '@/components/VBtn'
import VForm from '@/components/VForm'

const inputOne = Vue.component('input-one', {
  render (h) {
    return h(VTextField, {
      propsData: [(v) => !!v || 'Required']
    })
  }
})

test('VForm.js', ({ mount }) => {
  it('should pass on listeners to form element', async () => {
    const submit = jest.fn()
    const component = Vue.component('test', {
      render (h) {
        return h(VForm, {
          on: {
            submit
          }
        }, [
          h(VBtn, {
            props: {
              type: 'submit'
            },
            slot: 'default'
          }, ['Submit'])
        ])
      }
    })

    const wrapper = mount(component)

    const btn = wrapper.find('button')[0]

    btn.trigger('click')

    expect(submit).toBeCalled()
  })

  it('should watch the error bag', async () => {
    const wrapper = mount(VForm)

    const input = jest.fn()
    wrapper.vm.$on('input', input)

    Vue.set(wrapper.vm.errorBag, 'foo', true)
    await Vue.nextTick()
    expect(input).toBeCalledWith(false)

    Vue.set(wrapper.vm.errorBag, 'foo', false)
    await Vue.nextTick()
    expect(input).toBeCalledWith(true)
  })

  it('should register input child', async () => {
    const wrapper = mount(VForm, {
      slots: {
        default: [VTextField]
      }
    })

    await wrapper.vm.$nextTick()
    expect(wrapper.vm.inputs.length).toBe(1)
    expect(Object.keys(wrapper.vm.errorBag).length).toBe(1)
  })

  it.skip('should only watch children if not lazy', async () => {
    const wrapper = mount(VForm, {
      propsData: {
        lazyValidation: true
      },
      slots: {
        default: [VTextField]
      }
    })

    const input = wrapper.vm.getInputs()[0]
    wrapper.vm.watchChild(input)
    input.shouldValidate = true
    wrapper.vm.watchChild(input)
    await wrapper.vm.$nextTick()

    // beware, depends on number of computeds in VTextField
    const watchers = 28
    expect(input._watchers.length).toBe(watchers)
    input.shouldValidate = false
    wrapper.vm.watchChild(input)
    await wrapper.vm.$nextTick()

    expect(input._watchers.length).toBe(watchers + 1)
    input.shouldValidate = true
    await wrapper.vm.$nextTick()

    expect(Object.keys(wrapper.vm.errorBag).length).toBe(1)
  })

  it('should emit input when calling validate on lazy-validated form', async () => {
    const wrapper = mount(VForm, {
      propsData: {
        lazyValidation: true
      },
      slots: {
        default: [{
          render (h) {
            return h(VTextField, {
              props: {
                rules: [v => v === 1 || 'Error']
              }
            })
          }
        }]
      }
    })

    const value = jest.fn()
    wrapper.vm.$on('input', value)

    expect(wrapper.vm.validate()).toBe(false)

    await wrapper.vm.$nextTick()

    expect(value).toBeCalledWith(false)
  })

  it('should reset valid state', async () => {

    const wrapper = mount(VForm, {
      slots: {
        default: [VTextField]
      }
    })

    let value = jest.fn()
    wrapper.vm.$on('input', value)

    expect(Object.keys(wrapper.vm.errorBag).length).toBe(1)
    wrapper.vm.reset()
    await wrapper.vm.$nextTick()

    expect(value).toBeCalledWith(false)
    expect(Object.keys(wrapper.vm.errorBag).length).toBe(1)

    wrapper.setProps({ lazyValidation: true })
    await wrapper.vm.$nextTick()

    expect(value).toBeCalledWith(true)
    expect(Object.keys(wrapper.vm.errorBag).length).toBe(1)

    wrapper.vm.reset()
    await wrapper.vm.$nextTick()

    expect(value).toBeCalledWith(true)
    expect(Object.keys(wrapper.vm.errorBag).length).toBe(0)
  })
})
