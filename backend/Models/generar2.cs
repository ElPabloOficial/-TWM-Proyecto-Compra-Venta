using System;
using System.Collections.Generic;

namespace TiendaOnline.API.Models;

public partial class generar2
{
    public string id_usuario { get; set; } = null!;

    public int id_despacho { get; set; }

    public int? id_venta { get; set; }

    public virtual despacho id_despachoNavigation { get; set; } = null!;

    public virtual usuario id_usuarioNavigation { get; set; } = null!;

    public virtual ventum? id_ventaNavigation { get; set; }
}
