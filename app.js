// Task1: initiate app and run server at 3000
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.json({ limit: '100kb' }));

const path=require('path');
app.use(express.static(path.join(__dirname+'/dist/FrontEnd')));
// Task2: create mongoDB connection 
// The supplied static path uses FrontEnd; the actual directory is Frontend.
app.use(express.static(path.join(__dirname, 'dist', 'Frontend')));

const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    salary: { type: Number, required: true, min: 0 }
});
const Employee = mongoose.model('Employee', employeeSchema);

async function startServer() {
    if (!process.env.MONGODB_URI) {
        throw new Error('Set MONGODB_URI in .env to your MongoDB Atlas connection string.');
    }
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    return app.listen(process.env.PORT || 3000, () => {
        console.log(`Employee app running on port ${process.env.PORT || 3000}`);
    });
}

const asyncRoute = handler => (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
};

function employeeData(body) {
    const data = {};
    for (const field of ['name', 'location', 'position']) {
        if (typeof body?.[field] !== 'string' || !body[field].trim()) {
            const error = new Error(`${field} is required and must be text.`);
            error.status = 400;
            throw error;
        }
        data[field] = body[field].trim();
    }
    const salary = body?.salary;
    if (!['number', 'string'].includes(typeof salary) ||
        String(salary).trim() === '' || !Number.isFinite(Number(salary)) || Number(salary) < 0) {
        const error = new Error('salary must be a non-negative number.');
        error.status = 400;
        throw error;
    }
    data.salary = Number(salary);
    return data;
}

function checkId(req, res, next) {
    const id = req.params.id || req.body?._id;
    if (typeof id !== 'string' || !/^[a-fA-F0-9]{24}$/.test(id)) {
        return res.status(400).json({ message: 'A valid employee ID is required.' });
    }
    req.employeeId = id;
    next();
}


//Task 2 : write api with error handling and appropriate api mentioned in the TODO below







//TODO: get data from db  using api '/api/employeelist'
app.get('/api/employeelist', asyncRoute(async (req, res) => {
    res.json(await Employee.find());
}));




//TODO: get single data from db  using api '/api/employeelist/:id'
app.get('/api/employeelist/:id', checkId, asyncRoute(async (req, res) => {
    const employee = await Employee.findById(req.employeeId);
    if (!employee) return res.status(404).json({ message: 'Employee not found.' });
    res.json(employee);
}));





//TODO: send data from db using api '/api/employeelist'
//Request body format:{name:'',location:'',position:'',salary:''}
app.post('/api/employeelist', asyncRoute(async (req, res) => {
    const employee = await Employee.create(employeeData(req.body));
    res.status(201).json(employee);
}));






//TODO: delete a employee data from db by using api '/api/employeelist/:id'
app.delete('/api/employeelist/:id', checkId, asyncRoute(async (req, res) => {
    const employee = await Employee.findByIdAndDelete(req.employeeId);
    if (!employee) return res.status(404).json({ message: 'Employee not found.' });
    res.json({ message: 'Employee deleted.', employee });
}));





//TODO: Update  a employee data from db by using api '/api/employeelist'
// The provided frontend sends the complete employee, including _id, in the body.
app.put(['/api/employeelist', '/api/employeelist/:id'], checkId, asyncRoute(async (req, res) => {
    const employee = await Employee.findByIdAndUpdate(
        req.employeeId, { $set: employeeData(req.body) }, { new: true, runValidators: true }
    );
    if (!employee) return res.status(404).json({ message: 'Employee not found.' });
    res.json(employee);
}));

app.use('/api', (req, res) => res.status(404).json({ message: 'API route not found.' }));
app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    const status = error.status || (['ValidationError', 'CastError'].includes(error.name) ? 400 : 500);
    if (status >= 500) console.error(error.message);
    res.status(status).json({ message: status >= 500 ? 'Unable to complete database operation.' : error.message });
});
//Request body format:{name:'',location:'',position:'',salary:''}


//! dont delete this code. it connects the front end file.
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname + '/dist/Frontend/index.html'));
});

module.exports = { app, Employee, startServer };
if (require.main === module) {
    startServer().catch(error => {
        console.error('Unable to start employee app:', error.message);
        process.exitCode = 1;
    });
}



