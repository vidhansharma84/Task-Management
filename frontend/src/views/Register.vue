<template>
    <div class="font-[sans-serif]">
        <div class="min-h-screen flex fle-col items-center justify-center py-6 px-4">
            <div class="grid md:grid-cols-2 items-center gap-4 max-w-6xl w-full">
                <div
                    class="border border-gray-300 rounded-lg p-6 max-w-md shadow-[0_2px_22px_-4px_rgba(93,96,127,0.2)] max-md:mx-auto">
                    <form @submit.prevent="registerUser" class="space-y-4">
                        <div class="mb-8">
                            <h3 class="text-gray-800 text-3xl font-extrabold">Register Now</h3>
                            <p class="text-gray-500 text-sm mt-4 leading-relaxed">Sign in to your account and explore a
                                world of possibilities. Your journey begins here.</p>
                        </div>

                        <div>
                            <label class="text-gray-800 text-sm mb-2 block">Name</label>
                            <div class="relative flex items-center">
                                <input v-model="formData.name" name="name" type="text" required
                                    class="w-full text-sm text-gray-800 border border-gray-300 px-4 py-3 rounded-lg outline-blue-600"
                                    placeholder="Enter your name" />
                            </div>
                        </div>
                        <div>
                            <label class="text-gray-800 text-sm mb-2 block">Email</label>
                            <div class="relative flex items-center">
                                <input v-model="formData.email" name="email" type="email" required
                                    class="w-full text-sm text-gray-800 border border-gray-300 px-4 py-3 rounded-lg outline-blue-600"
                                    placeholder="Enter your email" />
                            </div>
                        </div>

                        <div>
                            <label class="text-gray-800 text-sm mb-2 block">Password</label>
                            <div class="relative flex items-center">
                                <input v-model="formData.password" name="password" type="password" required
                                    class="w-full text-sm text-gray-800 border border-gray-300 px-4 py-3 rounded-lg outline-blue-600"
                                    placeholder="Enter password" />
                            </div>
                        </div>

                        <div class="!mt-8">
                            <button type="submit"
                                class="w-full shadow-xl py-3 px-4 text-sm tracking-wide rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
                                Register
                            </button>
                        </div>

                        <router-link to="/">
                            <p class="text-sm !mt-8 text-center text-gray-800">Already have an account? <a
                                    href="javascript:void(0);"
                                    class="text-blue-600 font-semibold hover:underline ml-1 whitespace-nowrap">Login
                                    here</a></p>
                        </router-link>
                    </form>
                </div>
                <div class="lg:h-[400px] md:h-[300px] max-md:mt-8">
                    <img src="https://readymadeui.com/login-image.webp"
                        class="w-full h-full max-md:w-4/5 mx-auto block object-cover" alt="Dining Experience" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            formData: {
                name: '',
                email: '',
                password: ''
            }
        };
    },
    methods: {
        async registerUser() {
            try {
                const response = await axios.post('http://localhost:5000/register', this.formData);
                alert('Registration successful!');
                this.$router.push('/'); // Redirect to login page
            } catch (error) {
                alert('Error registering: ' + (error.response ? error.response.data : error.message));
            }
        }
    }
};
</script>

<style scoped>
/* Add any additional styling if needed */
</style>
