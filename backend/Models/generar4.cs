using System;
using System.Collections.Generic;

namespace TiendaOnline.API.Models;

public partial class generar4
{
    public int id_venta { get; set; }

    public int id_servicio { get; set; }

    public int cantidad { get; set; }

    public int totalfinal { get; set; }

    public int id_pago { get; set; }

    public virtual pago id_pagoNavigation { get; set; } = null!;

    public virtual servicio id_servicioNavigation { get; set; } = null!;

    public virtual ventum id_ventaNavigation { get; set; } = null!;
}
