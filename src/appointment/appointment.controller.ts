import { Controller, Post, Body, Get, Param, UsePipes } from '@nestjs/common';
import { AppointmentService } from './appointment.service';

import { Roles } from '../auth/guards/roles.guard';
import { CreateAppointmentDto } from './appointment.dto';
import { User, UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ZodValidationPipe } from '@anatine/zod-nestjs';
import config from '../config';
import { DoctorService } from '../doctor/doctor.service';

@Controller('appointment')
@UsePipes(ZodValidationPipe)
export class AppointmentController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly doctorService: DoctorService,
  ) {}

  @Get('patientAppointments')
  @Roles(UserRole.PATIENT)
  async getAppointments(@CurrentUser() user: User) {
    return this.appointmentService.getAppointmentsByPatient(user.id);
  }

  @Get('patient/:id')
  @Roles(UserRole.DOCTOR)
  async getAppointmentsByPatient(@Param('id') id: number) {
    return this.appointmentService.getAppointmentsByPatient(id);
  }

  @Post('')
  @Roles(UserRole.PATIENT)
  async createAppointment(
    @CurrentUser() user: User,
    @Body() createAppointmentDto: CreateAppointmentDto,
  ) {
    return this.appointmentService.createAppointment({
      ...createAppointmentDto,
      patientId: user.id,
    });
  }

  @Post('pay/:id/paypal')
  @Roles(UserRole.PATIENT)
  async payAppointmentWithPaypal(@Param('id') id: string) {
    return this.appointmentService.payAppointmentWithPaypal(Number(id));
  }

  @Get('pay/:id')
  async testPaymentWeb(@Param('id') id: string) {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
      <meta charset="UTF-8">
      <title>Pago con PayPal</title>
      <script src="https://sandbox.paypal.com/sdk/js?client-id=${config.paypalClientId}"></script>

      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      </head>
      <body class="bg-gray-100 flex items-center justify-center min-h-screen">
      <div class="bg-white p-8 rounded-lg shadow-md w-96">
      <h1 class="text-2xl font-bold mb-4 text-center">Pagar con PayPal</h1>
      
      <div id="login-container" class="mb-4">
      <label for="email" class="block text-sm font-medium text-gray-700">Correo Electrónico</label>
      <input value="paciente@prontopago.com" type="email" id="email" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
      
      <label for="password" class="block text-sm font-medium text-gray-700 mt-4">Contraseña</label>
      <input value="12345678" type="password" id="password" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
      
      <button id="login-button" class="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md">Iniciar Sesión</button>
      </div>

      <div id="paypal-button-container" class="mt-4" style="display: none;"></div>
      </div>

      <div id="test-credentials" style="z-index: 99999" class="fixed bottom-0 right-0 m-4 p-2 bg-white rounded-lg">
      <h2 class="text-lg font-bold mb-2">Test Credentials</h2>
      <p><strong>Testuser:</strong> sb-evjff32163485@personal.example.com</p>
      <p><strong>Testpassword:</strong> o3&lt;XS0o_</p>
      </div>

      <script>
      document.addEventListener('DOMContentLoaded', function() {
      const loginButton = document.getElementById('login-button');
      const paypalButtonContainer = document.getElementById('paypal-button-container');
      const loginContainer = document.getElementById('login-container');
      let token = '';

      loginButton.addEventListener('click', async () => {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
      const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
      });

      if (response.ok) {
      token = await response.text();
      loginContainer.style.display = 'none';
      paypalButtonContainer.style.display = 'block';
      } else {
      alert('Credenciales incorrectas');
      }
      } catch (error) {
      console.error('Error en el inicio de sesión:', error);
      alert('Ocurrió un error al iniciar sesión');
      }
      });

      paypal.Buttons({
      // Crear la orden
      createOrder: async (data, actions) => {
      try {
      const response = await fetch('/api/appointment/pay/${id}/paypal', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${token}\`
        }
      });

      const orderData = await response.json();
      console.log({ orderData });
      return orderData.id;
      } catch (error) {
      console.error('Error creando orden:', error);
      alert('No se pudo crear la orden de pago');
      }
      },

      // Capturar el pago
      onApprove: async (data, actions) => {
      try {
      console.log({ data })
      const response = await fetch(\`/api/paypal/capture-order/\${data.orderID}\`, {
        method: 'POST',
        headers: {
        'Authorization': \`Bearer \${token}\`
        }
      });

      const orderData = await response.json();
      
      if (orderData.status === 'COMPLETED') {
        alert('Pago completado exitosamente');
        // Aquí puedes agregar lógica adicional como redirección o actualización de UI
      } else {
        alert('El pago no se completó correctamente');
      }
      } catch (error) {
      console.error('Error capturando orden:', error);
      alert('Ocurrió un error al procesar el pago');
      }
      },

      onError: (err) => {
      console.error('Error en PayPal:', err);
      alert('Ocurrió un error con PayPal');
      }
      }).render('#paypal-button-container');
      });
      </script>
      </body>
      </html>
      `;
  }

  @Get('doctors')
  @Roles(UserRole.PATIENT)
  async getDoctors() {
    return this.doctorService.getDoctors();
  }
}
