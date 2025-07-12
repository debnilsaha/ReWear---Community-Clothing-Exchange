Selected Problem Statement:
ReWear---Community-Clothing-Exchange
  
Team Details:

1. Debnil Saha - Debnil.sce22@sot.pdpu.ac.in
2. Keyur Sonawane - Keyur.ce22@sot.pdpu.ac.in
3. Parth Pathak - parth.pee22@sot.pdpu.ac.in 

Demonstration Video Link:-
https://drive.google.com/file/d/1Y6_q_MXlzYwUZH3A3_K0eFB3L98qYgmP/view?usp=drive_link

**ReWear – Community Clothing Exchange**

**About the Project**
ReWear is a web‑based platform built from scratch during a hackathon to empower communities through sustainable fashion. Our mission is to reduce textile waste, promote reuse, and foster connections by enabling users to exchange, lend, or give away gently used clothing items.

**Why ReWear?**

* **Sustainability Focus**: Address the global issue of fast fashion waste.
* **Community‑Driven**: Facilitate local exchanges, strengthening social bonds.
* **Accessibility**: Simple UI/UX that anyone can use—no tutorials needed.

---

## 🚀 Key Features

1. **User Authentication & Profiles**

   * Secure sign‑up/login using JWT.
   * Editable user profiles with location and interests.

2. **Item Management**

   * Add, edit, or remove listings with photos, descriptions, and categories.
   * Browse items by category, size, or proximity.

3. **Exchange Workflow**

   * Initiate swap, borrow, or donate requests.
   * Real‑time chat integrated via WebSockets for negotiation.
   * Request tracking dashboard to manage incoming and outgoing requests.

4. **Admin Dashboard**

   * Monitor user activity and listings.
   * Approve or flag inappropriate content.

5. **Responsive Design**

   * Mobile‑first approach with Tailwind CSS.
   * Cross‑browser compatibility.

---

## 🛠 Tech Stack

| Layer                  | Technology                           |
| ---------------------- | ------------------------------------ |
| **Frontend**           | React.js, Tailwind CSS, React Router |
| **Backend**            | Node.js, Express.js, MongoDB         |
| **Authentication**     | JSON Web Tokens (JWT), bcrypt.js     |

---

## 🔧 Installation & Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/debnilsaha/ReWear---Community-Clothing-Exchange.git
   cd ReWear---Community-Clothing-Exchange
   ```

2. **Backend Setup**

   ```bash
   cd server
   npm install
   cp .env.example .env     # configure DB_URI, JWT_SECRET, CLOUDINARY_URL
   npm run dev
   ```

3. **Frontend Setup**

   ```bash
   cd client
   npm install
   cp .env.example .env     # configure REACT_APP_API_URL
   npm start
   ```

4. **Access the app**

   * Frontend: [http://localhost:3000](http://localhost:3000)
   * Backend API: [http://localhost:5000/api](http://localhost:5000/api)

---

## 🎯 Usage

* **Create account**: Sign up with email or OAuth.
* **List items**: Add clothing with photos and details.
* **Search & filter**: Find items by size, category etc.
* **Request exchange**: Choose swap, borrow, or donate workflows.
* **Chat**: Negotiate with other users in real time.

---

## 🤝 Contributing

We welcome contributions! Feel free to submit issues and pull requests:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m "Add something awesome"`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

> Built with ❤️ in a hackathon environment. Let’s make fashion sustainable, one swap at a time!
