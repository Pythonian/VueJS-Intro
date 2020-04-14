// A global cannel to send information

var eventBus = new Vue()

Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },
    template: `
        <div class="product">
            <div class="product-image">
                <img v-bind:src="image" />
            </div>
        
            <div class="product-info">
                <h1>{{ title }}</h1>
                <p v-if="inStock">In stock</p>
                <p v-else :class="{ outOfStock: !inStock }">Out of stock</p>

                <info-tabs :shipping="shipping" :details="details"></info-tabs>

                <div v-for="(variant, index) in variants" 
                        v-bind:key="variant.variantId"
                        class="color-box"
                        :style="{ backgroundColor: variant.variantColor }"
                        @mouseover="updateProduct(index)">
                </div>

                <button v-on:click="addToCart" 
                    :disabled="!inStock"
                    :class="{ disabledButton: !inStock }">Add to Cart</button>
            </div>    

            <product-tab :reviews="reviews"></product-tab>  

        </div>
    `,
    data() {
        return {
            brand: 'Vue Mastery',
            product: 'Boots',
            // image: 'vmSocks-green-onWhite.jpg',
            selectedVariant: 0,
            // inStock: true,
            // inventory: 7,
            onSale: false,
            details: ["80% cotton", "20% polyester", "Gender-neutral"],
            variants: [
                {
                    variantId: 2234,
                    variantColor: "green",
                    variantImage: 'vmSocks-green-onWhite.jpg',
                    variantQuantity: 10
                },
                {
                    variantId: 2235,
                    variantColor: "blue",
                    variantImage: 'vmSocks-blue-onWhite.jpg',
                    variantQuantity: 0
                }
            ],
            reviews: []
        }
    },
    methods: {
        addToCart() { 
            // informs the parent object of the click event
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId)
        },
        // updateProduct: function(variantImage) {
        //     this.image = variantImage
        // }
        updateProduct(index) {
            this.selectedVariant = index
        }
    },
    // Computed properties
    computed: {
        // display brand and product as one string
        title() {
            return this.brand + ' ' + this.product
        },
        image() {
            return this.variants[this.selectedVariant].variantImage
        },
        inStock() {
            return this.variants[this.selectedVariant].variantQuantity
        },
        sale() {
            if (this.onSale) {
                return this.brand + ' ' + this.product + ' are on sale'         
            }
            return this.brand + ' ' + this.product + ' are not on sale'
        },
        shipping() {
            if (this.premium) {
                return "Free"
            }
            return 2.99
        }
    },
    // A lifecycle hook
    mounted() {
        // put code you want to be run as soon as the component
        // is mounted to the DOM
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview)
        })
    }
})

Vue.component('product-tab', {
    props: {
        reviews: {
            type: Array,
            required: true
        }
    },
    template: `
        <div>
            <span class="tab"
                  :class="{ activeTab: selectedTab === tab }"
                  v-for="(tab, index) in tabs"
                  v-bind:key="index"
                  @click="selectedTab = tab">
                  {{ tab }}</span>

            <div v-show="selectedTab === 'Reviews'">
                <p v-if="!reviews.length">There are no reviews yet.</p>
                <ul>
                    <li v-for="review in reviews">
                        <p>{{ review.name }}</p>
                        <p>Rating: {{ review.rating }}</p>
                        <p>{{ review.review }}</p>
                    </li>
                </ul>
            </div>

            <div v-show="selectedTab === 'Make a Review'">
                <product-review></product-review>
            </div>

        </div>
    `,
    data() {
        return {
            tabs: ['Reviews', 'Make a Review'],
            selectedTab: 'Reviews'
        }
    }
})

Vue.component('info-tabs', {
    props: {
        details: {
            type: Array,
            required: true
        },
        shipping: {
            required: true
        }
    },
    template: `
        <div>
            <ul>
                <span class="tab"
                      :class="{ activeTab: selectedTab === tab }"
                      v-for="(tab, index) in tabs"
                      @click="selectedTab = tab"
                      :key="index">{{ tab }}</span>
            </ul>
            <div v-show="selectedTab === 'Shipping'">
                <p>{{ shipping }}</p>
            </div>
            <div v-show="selectedTab === 'Details'">
                <ul>
                    <li v-for="detail in details">{{ detail }}</li>
                </ul>
            </div>
        </div>
    `,
    data() {
        return {
            tabs: ['Shipping', 'Details'],
            selectedTab: 'Shipping'
        }
    }
})

Vue.component('product-review', {
    template: `
    <form class="review-form" @submit.prevent="onSubmit">

      <p v-if="errors.length">
        <b>Please correct the following error(s):</b>
        <ul>
          <li v-for="error in errors">{{ error }}</li>
        </ul>
      </p>
      <p>
        <label for="name">Name:</label>
        <input id="name" v-model="name" placeholder="name">
      </p>
      
      <p>
        <label for="review">Review:</label>      
        <textarea id="review" v-model="review"></textarea>
      </p>
      
      <p>
        <label for="rating">Rating:</label>
        <select id="rating" v-model.number="rating">
          <option>5</option>
          <option>4</option>
          <option>3</option>
          <option>2</option>
          <option>1</option>
        </select>
      </p>
          
      <p>
        <input type="submit" value="Submit">  
      </p>    
    
    </form>
    `,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            errors: []
        }
    },
    methods: {
        onSubmit() {
            if (this.name && this.review && this.rating) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating
                }
                // Send the submitted form to product detail
                eventBus.$emit('review-submitted', productReview)
                // Reset after form submission
                this.name = null
                this.review = null
                this.rating = null                
            }
            else {
                if(!this.name) this.errors.push("Name required.")
                if(!this.review) this.errors.push("Review required.")
                if(!this.rating) this.errors.push("Rating required.")
            }
        }
    }
})
var app = new Vue({ // new Vue instance; root of the app
    el: '#app', // Plugs the element into the DOM
    data: {
        premium: false,
        cart: []
    },
    methods: {
        updateCart(id) {
            // identify the id of the product just added
            this.cart.push(id) // this refers to the data of the instance
        }
    }
})