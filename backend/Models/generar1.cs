using System;
using System.Collections.Generic;

namespace TiendaOnline.API.Models;

public partial class generar1
{
    public string id_usuario { get; set; } = null!;

    public int id_devolucion { get; set; }

    public int id_venta { get; set; }

    public int id_producto { get; set; }

    public int cantidad { get; set; }

    public virtual devolucion id_devolucionNavigation { get; set; } = null!;

    public virtual producto id_productoNavigation { get; set; } = null!;

    public virtual usuario id_usuarioNavigation { get; set; } = null!;

    public virtual ventum id_ventaNavigation { get; set; } = null!;
}
