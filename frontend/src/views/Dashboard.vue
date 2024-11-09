<template>
    <div class="min-h-screen bg-gray-100 p-8">
        <h1 class="text-3xl font-bold mb-6 text-gray-800">Task Dashboard</h1>

        <!-- Add Task Button -->
        <div class="mb-4">
            <button @click="showAddTaskForm = true"
                class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                Add Task
            </button>
        </div>

        <!-- Add Task Form -->
        <div v-if="showAddTaskForm" class="mb-6 bg-white p-4 rounded shadow">
            <h2 class="text-xl font-semibold mb-4">Add New Task</h2>
            <form @submit.prevent="addTask">
                <div class="mb-3">
                    <label class="block text-gray-700 text-sm mb-2">Title</label>
                    <input v-model="newTask.title" type="text" required
                        class="w-full border border-gray-300 px-3 py-2 rounded" placeholder="Enter task title" />
                </div>
                <div class="mb-3">
                    <label class="block text-gray-700 text-sm mb-2">Description</label>
                    <textarea v-model="newTask.description" rows="3"
                        class="w-full border border-gray-300 px-3 py-2 rounded"
                        placeholder="Enter task description"></textarea>
                </div>
                <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Save Task
                </button>
                <button @click="showAddTaskForm = false" type="button"
                    class="ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                    Cancel
                </button>
            </form>
        </div>

        <!-- Task Table -->
        <div class="bg-white shadow rounded-lg overflow-hidden">
            <table class="min-w-full leading-normal">
                <thead>
                    <tr>
                        <th class="px-5 py-3 bg-gray-200 text-gray-800 text-left text-sm uppercase font-semibold">Title
                        </th>
                        <th class="px-5 py-3 bg-gray-200 text-gray-800 text-left text-sm uppercase font-semibold">
                            Description</th>
                        <th class="px-5 py-3 bg-gray-200 text-gray-800 text-left text-sm uppercase font-semibold">Status
                        </th>
                        <th class="px-5 py-3 bg-gray-200 text-gray-800 text-left text-sm uppercase font-semibold">
                            Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="task in tasks" :key="task._id" class="border-b border-gray-200 bg-white">
                        <td class="px-5 py-5 text-sm">{{ task.title }}</td>
                        <td class="px-5 py-5 text-sm">{{ task.description }}</td>
                        <td class="px-5 py-5 text-sm">
                            <span :class="task.completed ? 'text-green-600' : 'text-red-600'">
                                {{ task.completed ? 'Completed' : 'Pending' }}
                            </span>
                        </td>
                        <td class="px-5 py-5 text-sm space-x-2">
                            <button @click="editTask(task)"
                                class="bg-blue-500 text-white px-3 py-1 rounded">Edit</button>
                            <button @click="deleteTask(task._id)"
                                class="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            tasks: [],
            showAddTaskForm: false,
            newTask: {
                title: '',
                description: ''
            },
            taskToEdit: null,
            errorMessage: ''
        };
    },
    methods: {
        async fetchTasks() {
            try {
                const token = localStorage.getItem('token'); // Retrieve the token from localStorage

                if (!token) {
                    this.handleTokenError('No token found. Please log in.');
                    return;
                }

                const response = await axios.get('http://localhost:5000/tasks', {
                    headers: {
                        Authorization: `Bearer ${token}` // Include the token with Bearer prefix
                    }
                });
                this.tasks = response.data;
            } catch (error) {
                this.handleErrorResponse(error, 'Error fetching tasks');
            }
        },
        async addTask() {
            try {
                const token = localStorage.getItem('token'); // Retrieve the token from localStorage

                if (!token) {
                    this.handleTokenError('No token found. Please log in.');
                    return;
                }

                if (this.taskToEdit) {
                    await axios.put(`http://localhost:5000/tasks/${this.taskToEdit._id}`, this.newTask, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    this.taskToEdit = null;
                } else {
                    await axios.post('http://localhost:5000/tasks', this.newTask, {
                        headers: {
                            Authorization: `Bearer ${token}` // Include the token with Bearer prefix
                        }
                    });
                }

                this.fetchTasks(); // Refresh tasks
                this.newTask = { title: '', description: '' }; // Reset the form fields
                this.showAddTaskForm = false;
            } catch (error) {
                this.handleErrorResponse(error, 'Error saving task');
            }
        },
        editTask(task) {
            this.taskToEdit = task;
            this.newTask = { title: task.title, description: task.description };
            this.showAddTaskForm = true;
        },
        async deleteTask(taskId) {
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    this.handleTokenError('No token found. Please log in.');
                    return;
                }

                await axios.delete(`http://localhost:5000/tasks/${taskId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                this.fetchTasks(); // Refresh tasks after deletion
            } catch (error) {
                this.handleErrorResponse(error, 'Error deleting task');
            }
        },
        handleErrorResponse(error, defaultMessage) {
            if (error.response && (error.response.status === 403 || error.response.status === 401)) {
                this.handleTokenError('Session expired. Please log in again.');
            } else {
                this.errorMessage = defaultMessage + ': ' + (error.response ? error.response.data : error.message);
                alert(this.errorMessage);
            }
        },
        handleTokenError(message) {
            alert(message);
            localStorage.removeItem('token'); // Clear the token from localStorage
            this.$router.push('/'); // Redirect to login page
        }
    },
    mounted() {
        this.fetchTasks();
    }
};
</script>
