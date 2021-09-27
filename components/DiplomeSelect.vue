<template>
  <div>
    <div class="pr-4">
      <div class="relative z-0 inline-flex rounded-md mt-3 w-full">
        <div
          class="
            flex-1
            relative
            inline-flex
            items-center
            bg-gray-100
            py-2
            pl-3
            pr-4
            border border-transparent
            rounded-l-md
            text-gray-700
            cursor-pointer
          "
          @click="toggle"
        >
          <p v-if="!selected" class="text-left font-medium">
            Diplômes disponibles
          </p>
          <p v-else class="text-left font-medium">{{ selected.label }}</p>
        </div>
        <button
          type="button"
          class="
            relative
            inline-flex
            items-center
            bg-gray-100
            p-2
            rounded-l-none rounded-r-md
            text-sm
            font-medium
            text-gray-500
            hover:text-white hover:bg-indigo-600
            focus:outline-none
            focus:z-10
            focus:ring-2
            focus:ring-offset-2
            focus:ring-offset-gray-50
            focus:ring-indigo-500
          "
          aria-haspopup="listbox"
          aria-expanded="true"
          aria-labelledby="listbox-label"
          @click="toggle"
        >
          <span class="sr-only">Changer le diplôme</span>

          <svg
            class="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
    <ul
      :class="{ hidden: reduced }"
      class="
        origin-top-right
        absolute
        z-10
        left-0
        mt-2
        w-full
        h-64
        overflow-scroll
        sm:w-72
        rounded-md
        shadow-lg
        bg-white
        divide-y divide-gray-200
        ring-1 ring-black ring-opacity-5
        focus:outline-none
      "
      tabindex="-1"
      role="listbox"
      aria-labelledby="listbox-label"
      aria-activedescendant="listbox-option-0"
    >
      <!--
                                  Select option, manage highlight styles based on mouseenter/mouseleave and keyboard navigation.

                                  Highlighted: "text-white bg-indigo-500", Not Highlighted: "text-gray-900"
                                -->
      <li
        v-for="diplome in diplomes"
        :key="diplome.id"
        class="
          text-gray-900
          hover:bg-gray-50
          cursor-pointer
          select-none
          relative
          p-4
          text-sm
        "
        role="option"
        @click="select(diplome)"
      >
        <div class="flex flex-col">
          <div class="flex justify-between">
            <!-- Selected: "font-semibold", Not Selected: "font-normal" -->
            <p
              :class="{
                'font-semibold': isSelected(diplome),
              }"
            >
              {{ diplome.label }}
            </p>
            <!--
                                        Checkmark, only display for selected option.

                                        Highlighted: "text-white", Not Highlighted: "text-indigo-500"
                                      -->
            <span v-if="isSelected(diplome)" class="text-indigo-500">
              <!-- Heroicon name: solid/check -->
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </span>
          </div>
          <!-- Highlighted: "text-indigo-200", Not Highlighted: "text-gray-500" -->
          <p class="text-gray-500 mt-2">
            {{ diplome.region }}
          </p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, toRefs } from '@nuxtjs/composition-api'

interface Diplome {
  id: string
  label: string
  region: string
}

export default defineComponent({
  props: {
    diplomes: {
      type: Array as PropType<Diplome[]>,
      required: true,
    },
    selected: {
      type: Object as PropType<Diplome>,
      default: null,
    },
  },
  setup(props, { emit }) {
    const { selected } = toRefs(props)
    const reduced = ref(true)

    const toggle = () => {
      reduced.value = !reduced.value
    }

    const select = (diplome: Diplome) => {
      toggle()
      emit('select', diplome)
    }

    const isSelected = (diplome: Diplome) =>
      selected.value && selected.value.id === diplome.id

    return {
      reduced,
      select,
      toggle,
      isSelected,
    }
  },
})
</script>
