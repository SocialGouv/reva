<template>
  <ul
    class="
      origin-top-right
      absolute
      z-10
      left-0
      mt-2
      w-full
      sm:w-72
      rounded-md
      shadow-lg
      overflow-hidden
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
      class="text-gray-900 cursor-default select-none relative p-4 text-sm"
      role="option"
    >
      <div class="flex flex-col">
        <div class="flex justify-between">
          <!-- Selected: "font-semibold", Not Selected: "font-normal" -->
          <p class="font-semibold">
            Diplôme d'État d'accompagnement éducatif et social
          </p>
          <!--
                                        Checkmark, only display for selected option.

                                        Highlighted: "text-white", Not Highlighted: "text-indigo-500"
                                      -->
          <span class="text-indigo-500">
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
          Uniquement sur la région des Pays de la Loire : départements 44, 49,
          53, 72, 85
        </p>
      </div>
    </li>

    <li
      class="text-gray-900 cursor-default select-none relative p-4 text-sm"
      role="option"
    >
      <div class="flex flex-col">
        <div class="flex justify-between">
          <p class="font-normal">
            Diplôme d'État d'accompagnement éducatif et social
          </p>
        </div>
        <p class="text-gray-500 mt-2">
          Uniquement sur la région des Pays de la Loire<br />
          Département 44, 49, 53, 72, 85
        </p>
      </div>
    </li>
  </ul>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api'

interface Diplome {
  label: string
}

export default defineComponent({
  props: {
    diplomes: {
      type: Array as PropType<Diplome[]>,
      required: true,
    },
  },
})
</script>
